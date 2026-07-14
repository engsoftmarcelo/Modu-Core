import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCourseClassOptions } from "@/features/matriculas/turmas/queries";

import type { AttendanceStudent, AttendanceStatus } from "./types";

const attendanceEnrollmentStatuses = [
  "enrolled",
  "in_progress",
  "completed",
] as const;

export async function getAttendanceData({
  classDate,
  courseClassId,
}: {
  classDate: string;
  courseClassId?: string;
}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return {
      classes: [],
      students: [] as AttendanceStudent[],
    };
  }

  const classes = await getCourseClassOptions();

  if (!courseClassId) {
    return { classes, students: [] as AttendanceStudent[] };
  }

  const supabase = await createClient();
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id, status")
    .eq("organization_id", identity.organizationId)
    .eq("course_class_id", courseClassId)
    .in("status", [...attendanceEnrollmentStatuses])
    .order("created_at", { ascending: true });

  if (enrollmentsError) {
    throw new Error("Nao foi possivel carregar os alunos matriculados.");
  }

  const studentIds = [...new Set((enrollments ?? []).map((item) => item.student_id))];

  if (!studentIds.length) {
    return { classes, students: [] as AttendanceStudent[] };
  }

  const [studentsResult, attendanceResult] = await Promise.all([
    supabase
      .from("students")
      .select("id, name")
      .eq("organization_id", identity.organizationId)
      .in("id", studentIds),
    supabase
      .from("attendance_records")
      .select("student_id, status")
      .eq("organization_id", identity.organizationId)
      .eq("course_class_id", courseClassId)
      .eq("class_date", classDate),
  ]);

  if (studentsResult.error) {
    throw new Error("Nao foi possivel carregar os nomes dos alunos.");
  }

  if (attendanceResult.error) {
    throw new Error("Nao foi possivel carregar a frequencia desta aula.");
  }

  const studentNames = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student.name]),
  );
  const attendance = new Map(
    (attendanceResult.data ?? []).map((record) => [
      record.student_id,
      record.status as AttendanceStatus,
    ]),
  );

  const students = (enrollments ?? [])
    .map((enrollment) => ({
      enrollmentId: enrollment.id,
      status: attendance.get(enrollment.student_id) ?? "present",
      studentId: enrollment.student_id,
      studentName: studentNames.get(enrollment.student_id) ?? "Aluno sem nome",
    }))
    .sort((first, second) => first.studentName.localeCompare(second.studentName));

  return { classes, students };
}
