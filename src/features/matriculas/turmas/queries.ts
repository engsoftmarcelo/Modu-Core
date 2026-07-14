import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { CourseClass, CourseClassWithCourse } from "./types";

const classColumns =
  "id, organization_id, course_id, professional_id, teacher, start_date, end_date, weekdays, class_time, capacity, created_at, updated_at";

async function attachCourseNames(
  classes: CourseClass[],
  organizationId: string,
): Promise<CourseClassWithCourse[]> {
  const courseIds = [...new Set(classes.map((item) => item.course_id))];

  if (!courseIds.length) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", courseIds);

  if (error) {
    throw new Error("Nao foi possivel carregar os cursos das turmas.");
  }

  const courseNames = new Map((data ?? []).map((course) => [course.id, course.name]));

  return classes.map((item) => ({
    ...item,
    courseName: courseNames.get(item.course_id) ?? null,
  }));
}

export async function getCourseClasses() {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { classes: [] as CourseClassWithCourse[], count: 0 };
  }

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("course_classes")
    .select(classColumns, { count: "exact" })
    .eq("organization_id", identity.organizationId)
    .order("start_date", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Nao foi possivel carregar as turmas: ${error.message}`);
  }

  return {
    classes: await attachCourseNames(data ?? [], identity.organizationId),
    count: count ?? 0,
  };
}

export const getCourseClassById = cache(async function getCourseClassById(
  classId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_classes")
    .select(classColumns)
    .eq("id", classId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar a turma: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [classWithCourse] = await attachCourseNames([data], identity.organizationId);

  return classWithCourse ?? null;
});

export type CourseClassOption = {
  id: string;
  label: string;
};

export async function getCourseClassOptions(): Promise<CourseClassOption[]> {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return [];
  }

  const { classes } = await getCourseClasses();

  return classes.map((courseClass) => ({
    id: courseClass.id,
    label: `${courseClass.courseName ?? "Curso"} - ${courseClass.teacher}`,
  }));
}
