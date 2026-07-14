"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseCourseForm } from "./schema";
import type { CourseFormState } from "./types";

const courseIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): CourseFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): CourseFormState {
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

export async function createCourseAction(
  _previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const parsed = parseCourseForm(formData);

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
    .from("courses")
    .insert({
      organization_id: organizationId,
      name: values.name,
      description: nullable(values.description),
      workload_hours: values.workloadHours,
      price: values.price,
      modality: values.modality,
      active: values.active,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o curso. Verifique se ele ja existe.",
    );
  }

  revalidatePath("/matriculas/cursos");
  const demoSuffix = formData.get("demo") === "1" ? "&demo=1" : "";
  redirect(`/matriculas/cursos/${data.id}?created=1${demoSuffix}`);
}

export async function updateCourseAction(
  courseId: string,
  _previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  if (!courseIdSchema.safeParse(courseId).success) {
    return databaseError("Curso invalido.");
  }

  const parsed = parseCourseForm(formData);

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
    .from("courses")
    .update({
      name: values.name,
      description: nullable(values.description),
      workload_hours: values.workloadHours,
      price: values.price,
      modality: values.modality,
      active: values.active,
    })
    .eq("id", courseId)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o curso. Confira se ele ainda existe.",
    );
  }

  revalidatePath("/matriculas/cursos");
  revalidatePath(`/matriculas/cursos/${courseId}`);
  redirect(`/matriculas/cursos/${courseId}?updated=1`);
}
