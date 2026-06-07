import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  customers: number;
  openLeads: number;
  pendingTasks: number;
  upcomingAppointments: number;
  acceptedRevenue: number;
};

export async function getDashboardMetrics(
  organizationId: string | null,
): Promise<DashboardMetrics> {
  if (!organizationId) {
    return {
      customers: 0,
      openLeads: 0,
      pendingTasks: 0,
      upcomingAppointments: 0,
      acceptedRevenue: 0,
    };
  }

  const supabase = await createClient();
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const [
    customersResult,
    leadsResult,
    tasksResult,
    appointmentsResult,
    proposalsResult,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", ["new", "contacted", "qualified"]),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", ["pending", "in_progress"]),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .gte("starts_at", now.toISOString())
      .lt("starts_at", nextWeek.toISOString())
      .in("status", ["scheduled", "confirmed"]),
    supabase
      .from("proposals")
      .select("total")
      .eq("organization_id", organizationId)
      .eq("status", "accepted"),
  ]);

  return {
    customers: customersResult.count ?? 0,
    openLeads: leadsResult.count ?? 0,
    pendingTasks: tasksResult.count ?? 0,
    upcomingAppointments: appointmentsResult.count ?? 0,
    acceptedRevenue:
      proposalsResult.data?.reduce((total, proposal) => total + proposal.total, 0) ??
      0,
  };
}
