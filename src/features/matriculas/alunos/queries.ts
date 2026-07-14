import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { Student, StudentStatus } from "./types";

export type StudentListFilters = {
  query?: string;
  status?: StudentStatus | "all";
};

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

export async function getStudents(filters: StudentListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { students: [] as Student[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select(
      "id, organization_id, name, whatsapp, email, cpf, notes, status, created_at, updated_at",
      { count: "exact" },
    )
    .eq("organization_id", identity.organizationId)
    .order("name")
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      [
        `name.ilike.%${searchTerm}%`,
        `email.ilike.%${searchTerm}%`,
        `whatsapp.ilike.%${searchTerm}%`,
        `cpf.ilike.%${searchTerm}%`,
      ].join(","),
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os alunos: ${error.message}`);
  }

  return {
    students: data ?? [],
    count: count ?? 0,
  };
}

export const getStudentById = cache(async function getStudentById(
  studentId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, organization_id, name, whatsapp, email, cpf, notes, status, created_at, updated_at",
    )
    .eq("id", studentId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o aluno: ${error.message}`);
  }

  return data;
});

export type StudentOption = {
  id: string;
  name: string;
};

export async function getStudentOptions(): Promise<StudentOption[]> {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name")
    .eq("organization_id", identity.organizationId)
    .eq("status", "active")
    .order("name");

  if (error) {
    throw new Error(`Nao foi possivel carregar os alunos: ${error.message}`);
  }

  return data ?? [];
}
