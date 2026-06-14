import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CrmDashboardMetrics = {
  newLeads: number;
  sentProposals: number;
  closedProposals: number;
  negotiationValue: number;
  pendingTasks: number;
};

const emptyMetrics: CrmDashboardMetrics = {
  newLeads: 0,
  sentProposals: 0,
  closedProposals: 0,
  negotiationValue: 0,
  pendingTasks: 0,
};

export async function getCrmDashboardMetrics(): Promise<CrmDashboardMetrics> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return emptyMetrics;
  }

  const supabase = await createClient();
  const [
    newLeadsResult,
    sentProposalsResult,
    closedProposalsResult,
    negotiationResult,
    pendingTasksResult,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", identity.organizationId)
      .eq("status", "new"),
    supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", identity.organizationId)
      .eq("status", "sent"),
    supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", identity.organizationId)
      .eq("status", "accepted"),
    supabase
      .from("leads")
      .select("estimated_value")
      .eq("organization_id", identity.organizationId)
      .eq("status", "negotiation"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", identity.organizationId)
      .in("status", ["pending", "in_progress"]),
  ]);

  const firstError = [
    newLeadsResult.error,
    sentProposalsResult.error,
    closedProposalsResult.error,
    negotiationResult.error,
    pendingTasksResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error(
      `Nao foi possivel carregar o dashboard do CRM: ${firstError.message}`,
    );
  }

  return {
    newLeads: newLeadsResult.count ?? 0,
    sentProposals: sentProposalsResult.count ?? 0,
    closedProposals: closedProposalsResult.count ?? 0,
    negotiationValue: (negotiationResult.data ?? []).reduce(
      (total, lead) => total + lead.estimated_value,
      0,
    ),
    pendingTasks: pendingTasksResult.count ?? 0,
  };
}
