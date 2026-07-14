"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseStudentForm } from "./schema";
import type { StudentFormState } from "./types";

const studentIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): StudentFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): StudentFormState {
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

export async function createStudentAction(
  _previousState: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  const parsed = parseStudentForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .insert({
      organization_id: organizationId,
      name: values.name,
      whatsapp: nullable(values.whatsapp),
      email: nullable(values.email.toLowerCase()),
      cpf: nullable(values.cpf),
      notes: nullable(values.notes),
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o aluno. Tente novamente em instantes.",
    );
  }

  revalidatePath("/matriculas");
  revalidatePath("/dashboard");

  const demoMode = formData.get("demo") === "1";
  const demoClassId = String(formData.get("demoClassId") ?? "");
  const destination = demoMode
    ? studentIdSchema.safeParse(demoClassId).success
      ? `/matriculas/inscricoes/novo?demo=1&classId=${demoClassId}&studentId=${data.id}`
      : "/matriculas/demo?ready=1"
    : `/matriculas/${data.id}?created=1`;

  redirect(destination);
}

export async function updateStudentAction(
  studentId: string,
  _previousState: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  if (!studentIdSchema.safeParse(studentId).success) {
    return databaseError("Aluno invalido.");
  }

  const parsed = parseStudentForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .update({
      name: values.name,
      whatsapp: nullable(values.whatsapp),
      email: nullable(values.email.toLowerCase()),
      cpf: nullable(values.cpf),
      notes: nullable(values.notes),
      status: values.status,
    })
    .eq("id", studentId)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o aluno. Confira se ele ainda existe.",
    );
  }

  revalidatePath("/matriculas");
  revalidatePath(`/matriculas/${studentId}`);
  redirect(`/matriculas/${studentId}?updated=1`);
}
