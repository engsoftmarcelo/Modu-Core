"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { parseAttendanceForm } from "./schema";
import type { AttendanceFormState } from "./types";

const enrollmentIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): AttendanceFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): AttendanceFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

async function getOrganizationId() {
  const identity = await getWorkspaceIdentity();
  return identity?.organizationId ?? null;
}

async function getEnrolledStudentIds(courseClassId: string, organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("course_class_id", courseClassId)
    .in("status", ["enrolled", "paid", "in_progress", "completed"]);

  if (error) {
    return null;
  }

  return new Set((data ?? []).map((item) => item.student_id));
}

export async function saveAttendanceAction(
  _previousState: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const parsed = parseAttendanceForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const enrolledStudentIds = await getEnrolledStudentIds(
    values.courseClassId,
    organizationId,
  );

  if (!enrolledStudentIds) {
    return databaseError("Nao foi possivel validar os alunos da turma.");
  }

  const hasInvalidStudent = values.records.some(
    (record) => !enrolledStudentIds.has(record.studentId),
  );

  if (hasInvalidStudent) {
    return databaseError("A lista possui aluno que nao pertence a esta turma.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("attendance_records").upsert(
    values.records.map((record) => ({
      class_date: values.classDate,
      course_class_id: values.courseClassId,
      organization_id: organizationId,
      status: record.status,
      student_id: record.studentId,
    })),
    {
      onConflict: "organization_id,course_class_id,student_id,class_date",
    },
  );

  if (error) {
    return databaseError("Nao foi possivel salvar a frequencia. Tente novamente.");
  }

  revalidatePath("/matriculas/frequencia");
  const redirectParams = new URLSearchParams({
    classId: values.courseClassId,
    date: values.classDate,
    saved: "1",
  });
  const enrollmentId = String(formData.get("demoEnrollmentId") ?? "");

  if (
    formData.get("demo") === "1" &&
    enrollmentIdSchema.safeParse(enrollmentId).success
  ) {
    redirectParams.set("demo", "1");
    redirectParams.set("enrollmentId", enrollmentId);
  }

  redirect(`/matriculas/frequencia?${redirectParams.toString()}`);
}
