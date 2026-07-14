"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { parseEnrollmentForm } from "./schema";
import type { EnrollmentFormState } from "./types";

const enrollmentIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): EnrollmentFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): EnrollmentFormState {
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

async function ensureStudentBelongsToOrganization(
  studentId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function ensureClassBelongsToOrganization(
  classId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_classes")
    .select("id")
    .eq("id", classId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createEnrollmentAction(
  _previousState: EnrollmentFormState,
  formData: FormData,
): Promise<EnrollmentFormState> {
  const parsed = parseEnrollmentForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;

  if (!(await ensureStudentBelongsToOrganization(values.studentId, organizationId))) {
    return databaseError("Selecione um aluno valido para esta matricula.");
  }

  if (!(await ensureClassBelongsToOrganization(values.courseClassId, organizationId))) {
    return databaseError("Selecione uma turma valida para esta matricula.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      organization_id: organizationId,
      student_id: values.studentId,
      course_class_id: values.courseClassId,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar a matricula. Confira se este aluno ja esta nesta turma.",
    );
  }

  revalidatePath("/matriculas/inscricoes");
  const demoSuffix = formData.get("demo") === "1" ? "&demo=1" : "";
  redirect(`/matriculas/inscricoes/${data.id}?created=1${demoSuffix}`);
}

export async function updateEnrollmentAction(
  enrollmentId: string,
  _previousState: EnrollmentFormState,
  formData: FormData,
): Promise<EnrollmentFormState> {
  if (!enrollmentIdSchema.safeParse(enrollmentId).success) {
    return databaseError("Matricula invalida.");
  }

  const parsed = parseEnrollmentForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;

  if (!(await ensureStudentBelongsToOrganization(values.studentId, organizationId))) {
    return databaseError("Selecione um aluno valido para esta matricula.");
  }

  if (!(await ensureClassBelongsToOrganization(values.courseClassId, organizationId))) {
    return databaseError("Selecione uma turma valida para esta matricula.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      student_id: values.studentId,
      course_class_id: values.courseClassId,
      status: values.status,
    })
    .eq("id", enrollmentId)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar a matricula. Confira se ela ainda existe.",
    );
  }

  revalidatePath("/matriculas/inscricoes");
  revalidatePath(`/matriculas/inscricoes/${enrollmentId}`);
  redirect(`/matriculas/inscricoes/${enrollmentId}?updated=1`);
}
