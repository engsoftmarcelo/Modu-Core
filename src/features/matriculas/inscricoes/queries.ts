import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { Enrollment, EnrollmentWithRelations } from "./types";

const enrollmentColumns =
  "id, organization_id, student_id, course_class_id, status, payment_status, created_at, updated_at";

async function attachRelations(
  enrollments: Enrollment[],
  organizationId: string,
): Promise<EnrollmentWithRelations[]> {
  if (!enrollments.length) {
    return [];
  }

  const studentIds = [...new Set(enrollments.map((item) => item.student_id))];
  const classIds = [...new Set(enrollments.map((item) => item.course_class_id))];
  const supabase = await createClient();

  const [studentsResult, classesResult] = await Promise.all([
    supabase
      .from("students")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", studentIds),
    supabase
      .from("course_classes")
      .select("id, course_id, teacher")
      .eq("organization_id", organizationId)
      .in("id", classIds),
  ]);

  if (studentsResult.error) {
    throw new Error("Nao foi possivel carregar os alunos das matriculas.");
  }

  if (classesResult.error) {
    throw new Error("Nao foi possivel carregar as turmas das matriculas.");
  }

  const classes = classesResult.data ?? [];
  const courseIds = [...new Set(classes.map((item) => item.course_id))];
  const coursesResult = courseIds.length
    ? await supabase
        .from("courses")
        .select("id, name")
        .eq("organization_id", organizationId)
        .in("id", courseIds)
    : { data: [], error: null };

  if (coursesResult.error) {
    throw new Error("Nao foi possivel carregar os cursos das matriculas.");
  }

  const studentNames = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student.name]),
  );
  const courseNames = new Map(
    (coursesResult.data ?? []).map((course) => [course.id, course.name]),
  );
  const classMap = new Map(classes.map((item) => [item.id, item]));

  return enrollments.map((item) => {
    const courseClass = classMap.get(item.course_class_id);
    const courseName = courseClass
      ? (courseNames.get(courseClass.course_id) ?? null)
      : null;

    return {
      ...item,
      className: courseName,
      courseName,
      studentName: studentNames.get(item.student_id) ?? null,
      teacher: courseClass?.teacher ?? null,
    };
  });
}

export async function getEnrollments() {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { enrollments: [] as EnrollmentWithRelations[], count: 0 };
  }

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("enrollments")
    .select(enrollmentColumns, { count: "exact" })
    .eq("organization_id", identity.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Nao foi possivel carregar as matriculas: ${error.message}`);
  }

  return {
    enrollments: await attachRelations(data ?? [], identity.organizationId),
    count: count ?? 0,
  };
}

export const getEnrollmentById = cache(async function getEnrollmentById(
  enrollmentId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(enrollmentColumns)
    .eq("id", enrollmentId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar a matricula: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [enrollment] = await attachRelations([data], identity.organizationId);

  return enrollment ?? null;
});
