import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  leadStatuses,
  type Lead,
  type LeadStatus,
} from "./types";

export type LeadListFilters = {
  query?: string;
  status?: LeadStatus | "all";
};

export type LeadStats = Record<LeadStatus, number>;

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

export async function getLeads(filters: LeadListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { leads: [] as Lead[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select(
      "id, organization_id, owner_id, name, company, email, phone, source, status, estimated_value, notes, created_at, updated_at",
      { count: "exact" },
    )
    .eq("organization_id", identity.organizationId)
    .order("created_at", { ascending: false })
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
        `source.ilike.%${searchTerm}%`,
      ].join(","),
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os leads: ${error.message}`);
  }

  return {
    leads: data ?? [],
    count: count ?? 0,
  };
}

export async function getLeadStats(): Promise<LeadStats> {
  const emptyStats = Object.fromEntries(
    leadStatuses.map((status) => [status, 0]),
  ) as LeadStats;
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return emptyStats;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("status")
    .eq("organization_id", identity.organizationId);

  if (error) {
    throw new Error(`Nao foi possivel carregar o funil: ${error.message}`);
  }

  return (data ?? []).reduce((stats, lead) => {
    stats[lead.status] += 1;
    return stats;
  }, emptyStats);
}

export const getLeadById = cache(async function getLeadById(leadId: string) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, organization_id, owner_id, name, company, email, phone, source, status, estimated_value, notes, created_at, updated_at",
    )
    .eq("id", leadId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o lead: ${error.message}`);
  }

  return data;
});
