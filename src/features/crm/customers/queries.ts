import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { Customer, CustomerStatus } from "./types";

export type CustomerListFilters = {
  query?: string;
  status?: CustomerStatus | "all";
};

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

export async function getCustomers(filters: CustomerListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { customers: [] as Customer[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select(
      "id, organization_id, name, company, phone, whatsapp, email, segment, document, notes, status, created_at, updated_at",
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
        `company.ilike.%${searchTerm}%`,
        `email.ilike.%${searchTerm}%`,
        `phone.ilike.%${searchTerm}%`,
        `whatsapp.ilike.%${searchTerm}%`,
        `segment.ilike.%${searchTerm}%`,
      ].join(","),
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os clientes: ${error.message}`);
  }

  return {
    customers: data ?? [],
    count: count ?? 0,
  };
}

export const getCustomerById = cache(async function getCustomerById(
  customerId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, organization_id, name, company, phone, whatsapp, email, segment, document, notes, status, created_at, updated_at",
    )
    .eq("id", customerId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o cliente: ${error.message}`);
  }

  return data;
});
