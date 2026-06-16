import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type {
  Professional,
  ProfessionalFilter,
  ProfessionalWithServices,
  ServiceOption,
} from "./types";

export type ProfessionalListFilters = {
  query?: string;
  situation?: ProfessionalFilter;
};

export type ProfessionalStats = {
  active: number;
  inactive: number;
  coveredServices: number;
};

const professionalColumns =
  "id, organization_id, name, specialty, available_hours, active, created_at, updated_at";

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

async function attachServices(
  professionals: Professional[],
  organizationId: string,
): Promise<ProfessionalWithServices[]> {
  if (!professionals.length) {
    return [];
  }

  const supabase = await createClient();
  const { data: links, error: linksError } = await supabase
    .from("professional_services")
    .select("professional_id, service_id")
    .eq("organization_id", organizationId)
    .in(
      "professional_id",
      professionals.map((professional) => professional.id),
    );

  if (linksError) {
    throw new Error("Nao foi possivel carregar os servicos dos profissionais.");
  }

  const serviceIds = [...new Set((links ?? []).map((link) => link.service_id))];
  const serviceNames = new Map<string, string>();

  if (serviceIds.length) {
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", serviceIds);

    if (servicesError) {
      throw new Error("Nao foi possivel carregar os servicos dos profissionais.");
    }

    for (const service of services ?? []) {
      serviceNames.set(service.id, service.name);
    }
  }

  const servicesByProfessional = new Map<
    string,
    ProfessionalWithServices["services"]
  >();

  for (const link of links ?? []) {
    const name = serviceNames.get(link.service_id);
    if (!name) continue;

    const current = servicesByProfessional.get(link.professional_id) ?? [];
    current.push({ id: link.service_id, name });
    servicesByProfessional.set(link.professional_id, current);
  }

  return professionals.map((professional) => ({
    ...professional,
    services: (servicesByProfessional.get(professional.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    ),
  }));
}

export async function getProfessionals(filters: ProfessionalListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { professionals: [] as ProfessionalWithServices[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("professionals")
    .select(professionalColumns, { count: "exact" })
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
      `name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os profissionais: ${error.message}`);
  }

  return {
    professionals: await attachServices(data ?? [], identity.organizationId),
    count: count ?? 0,
  };
}

export async function getProfessionalStats(): Promise<ProfessionalStats> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { active: 0, inactive: 0, coveredServices: 0 };
  }

  const supabase = await createClient();
  const [professionalsResult, linksResult] = await Promise.all([
    supabase
      .from("professionals")
      .select("active")
      .eq("organization_id", identity.organizationId),
    supabase
      .from("professional_services")
      .select("service_id")
      .eq("organization_id", identity.organizationId),
  ]);

  if (professionalsResult.error || linksResult.error) {
    throw new Error("Nao foi possivel carregar os indicadores dos profissionais.");
  }

  const rows = professionalsResult.data ?? [];
  const active = rows.filter((professional) => professional.active).length;

  return {
    active,
    inactive: rows.length - active,
    coveredServices: new Set(
      (linksResult.data ?? []).map((link) => link.service_id),
    ).size,
  };
}

export async function getServiceOptions(): Promise<ServiceOption[]> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, active")
    .eq("organization_id", identity.organizationId)
    .order("active", { ascending: false })
    .order("name")
    .limit(200);

  if (error) {
    throw new Error("Nao foi possivel carregar os servicos.");
  }

  return data ?? [];
}

export const getProfessionalById = cache(async function getProfessionalById(
  professionalId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select(professionalColumns)
    .eq("id", professionalId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o profissional: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [professional] = await attachServices([data], identity.organizationId);
  return professional;
});

export function isProfessionalFilter(
  value: string | undefined,
): value is ProfessionalFilter {
  return value === "all" || value === "active" || value === "inactive";
}
