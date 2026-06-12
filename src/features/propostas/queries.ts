import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  proposalStatuses,
  type Proposal,
  type ProposalCustomerOption,
  type ProposalStatus,
  type ProposalWithCustomer,
} from "./types";

export type ProposalListFilters = {
  query?: string;
  status?: ProposalStatus | "all";
};

export type ProposalStats = {
  draft: number;
  sent: number;
  accepted: number;
  acceptedValue: number;
};

const proposalColumns =
  "id, organization_id, customer_id, title, status, valid_until, subtotal, discount, total, services, notes, created_at, updated_at";

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

async function attachCustomers(
  proposals: Proposal[],
  organizationId: string,
): Promise<ProposalWithCustomer[]> {
  const customerIds = [
    ...new Set(
      proposals.flatMap((proposal) =>
        proposal.customer_id ? [proposal.customer_id] : [],
      ),
    ),
  ];

  if (!customerIds.length) {
    return proposals.map((proposal) => ({ ...proposal, customerName: null }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", customerIds);

  if (error) {
    throw new Error("Nao foi possivel carregar os clientes das propostas.");
  }

  const customerNames = new Map(
    (data ?? []).map((customer) => [customer.id, customer.name]),
  );

  return proposals.map((proposal) => ({
    ...proposal,
    customerName: proposal.customer_id
      ? customerNames.get(proposal.customer_id) ?? null
      : null,
  }));
}

export async function getProposals(filters: ProposalListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { proposals: [] as ProposalWithCustomer[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("proposals")
    .select(proposalColumns, { count: "exact" })
    .eq("organization_id", identity.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,services.ilike.%${searchTerm}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar as propostas: ${error.message}`);
  }

  return {
    proposals: await attachCustomers(data ?? [], identity.organizationId),
    count: count ?? 0,
  };
}

export async function getProposalStats(): Promise<ProposalStats> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { draft: 0, sent: 0, accepted: 0, acceptedValue: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("status, total")
    .eq("organization_id", identity.organizationId);

  if (error) {
    throw new Error(`Nao foi possivel carregar os indicadores: ${error.message}`);
  }

  return (data ?? []).reduce<ProposalStats>(
    (stats, proposal) => {
      if (proposal.status === "draft") stats.draft += 1;
      if (proposal.status === "sent") stats.sent += 1;
      if (proposal.status === "accepted") {
        stats.accepted += 1;
        stats.acceptedValue += proposal.total;
      }

      return stats;
    },
    { draft: 0, sent: 0, accepted: 0, acceptedValue: 0 },
  );
}

export async function getProposalCustomerOptions(): Promise<
  ProposalCustomerOption[]
> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, company")
    .eq("organization_id", identity.organizationId)
    .order("name")
    .limit(200);

  if (error) {
    throw new Error("Nao foi possivel carregar os clientes.");
  }

  return (data ?? []).map((customer) => ({
    id: customer.id,
    label: customer.company
      ? `${customer.name} - ${customer.company}`
      : customer.name,
  }));
}

export const getProposalById = cache(async function getProposalById(
  proposalId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select(proposalColumns)
    .eq("id", proposalId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar a proposta: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [proposal] = await attachCustomers([data], identity.organizationId);
  return proposal;
});

export function isProposalStatus(
  value: string | undefined,
): value is ProposalStatus {
  return proposalStatuses.includes(value as ProposalStatus);
}
