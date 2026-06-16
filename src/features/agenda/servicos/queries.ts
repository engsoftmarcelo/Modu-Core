import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { Service, ServiceFilter } from "./types";

export type ServiceListFilters = {
  query?: string;
  situation?: ServiceFilter;
};

export type ServiceStats = {
  active: number;
  inactive: number;
  averagePrice: number;
  averageDuration: number;
};

const serviceColumns =
  "id, organization_id, name, description, price, duration_minutes, active, created_at, updated_at";

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

export async function getServices(filters: ServiceListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { services: [] as Service[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select(serviceColumns, { count: "exact" })
    .eq("organization_id", identity.organizationId)
    .order("active", { ascending: false })
    .order("name")
    .limit(100);

  if (filters.situation === "active") {
    query = query.eq("active", true);
  } else if (filters.situation === "inactive") {
    query = query.eq("active", false);
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os servicos: ${error.message}`);
  }

  return {
    services: data ?? [],
    count: count ?? 0,
  };
}

export async function getServiceStats(): Promise<ServiceStats> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { active: 0, inactive: 0, averagePrice: 0, averageDuration: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("active, price, duration_minutes")
    .eq("organization_id", identity.organizationId);

  if (error) {
    throw new Error(`Nao foi possivel carregar os indicadores: ${error.message}`);
  }

  const rows = data ?? [];
  const activeRows = rows.filter((service) => service.active);
  const durationRows = activeRows.filter(
    (service) => typeof service.duration_minutes === "number",
  );

  const priceSum = activeRows.reduce((total, service) => total + service.price, 0);
  const durationSum = durationRows.reduce(
    (total, service) => total + (service.duration_minutes ?? 0),
    0,
  );

  return {
    active: activeRows.length,
    inactive: rows.length - activeRows.length,
    averagePrice: activeRows.length ? priceSum / activeRows.length : 0,
    averageDuration: durationRows.length
      ? Math.round(durationSum / durationRows.length)
      : 0,
  };
}

export const getServiceById = cache(async function getServiceById(
  serviceId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(serviceColumns)
    .eq("id", serviceId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o servico: ${error.message}`);
  }

  return data;
});

export function isServiceFilter(value: string | undefined): value is ServiceFilter {
  return value === "all" || value === "active" || value === "inactive";
}
