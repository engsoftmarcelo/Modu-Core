"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { parseCourseClassForm } from "./schema";
import type { CourseClassFormState } from "./types";

const classIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): CourseClassFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): CourseClassFormState {
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

async function ensureCourseBelongsToOrganization(
  courseId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createCourseClassAction(
  _previousState: CourseClassFormState,
  formData: FormData,
): Promise<CourseClassFormState> {
  const parsed = parseCourseClassForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;

  if (!(await ensureCourseBelongsToOrganization(values.courseId, organizationId))) {
    return databaseError("Selecione um curso valido para esta turma.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_classes")
    .insert({
      organization_id: organizationId,
      course_id: values.courseId,
      teacher: values.teacher,
      start_date: values.startDate,
      end_date: values.endDate,
      weekdays: values.weekdays,
      class_time: values.classTime,
      capacity: values.capacity,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError("Nao foi possivel criar a turma. Tente novamente.");
  }

  revalidatePath("/matriculas/turmas");
  const demoSuffix = formData.get("demo") === "1" ? "&demo=1" : "";
  redirect(`/matriculas/turmas/${data.id}?created=1${demoSuffix}`);
}

export async function updateCourseClassAction(
  classId: string,
  _previousState: CourseClassFormState,
  formData: FormData,
): Promise<CourseClassFormState> {
  if (!classIdSchema.safeParse(classId).success) {
    return databaseError("Turma invalida.");
  }

  const parsed = parseCourseClassForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;

  if (!(await ensureCourseBelongsToOrganization(values.courseId, organizationId))) {
    return databaseError("Selecione um curso valido para esta turma.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_classes")
    .update({
      course_id: values.courseId,
      teacher: values.teacher,
      start_date: values.startDate,
      end_date: values.endDate,
      weekdays: values.weekdays,
      class_time: values.classTime,
      capacity: values.capacity,
    })
    .eq("id", classId)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar a turma. Confira se ela ainda existe.",
    );
  }

  revalidatePath("/matriculas/turmas");
  revalidatePath(`/matriculas/turmas/${classId}`);
  redirect(`/matriculas/turmas/${classId}?updated=1`);
}
