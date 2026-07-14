import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { Course } from "./types";

export type CourseListFilters = {
  active?: "active" | "inactive" | "all";
  query?: string;
};

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

const courseColumns =
  "id, organization_id, name, description, workload_hours, price, modality, active, created_at, updated_at";

export async function getCourses(filters: CourseListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { courses: [] as Course[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(courseColumns, { count: "exact" })
    .eq("organization_id", identity.organizationId)
    .order("name")
    .limit(100);

  if (filters.active && filters.active !== "all") {
    query = query.eq("active", filters.active === "active");
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      [`name.ilike.%${searchTerm}%`, `description.ilike.%${searchTerm}%`].join(
        ",",
      ),
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os cursos: ${error.message}`);
  }

  return {
    courses: data ?? [],
    count: count ?? 0,
  };
}

export const getCourseById = cache(async function getCourseById(courseId: string) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(courseColumns)
    .eq("id", courseId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o curso: ${error.message}`);
  }

  return data;
});

export type CourseOption = {
  id: string;
  name: string;
};

export async function getActiveCourseOptions(): Promise<CourseOption[]> {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("organization_id", identity.organizationId)
    .eq("active", true)
    .order("name");

  if (error) {
    throw new Error(`Nao foi possivel carregar os cursos: ${error.message}`);
  }

  return data ?? [];
}
