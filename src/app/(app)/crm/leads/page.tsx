import type { Metadata } from "next";
import { Plus, Target } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { LeadKanban } from "@/features/crm/leads/components/lead-kanban";
import { LeadList } from "@/features/crm/leads/components/lead-list";
import { LeadPipelineSummary } from "@/features/crm/leads/components/lead-pipeline-summary";
import { LeadSearch } from "@/features/crm/leads/components/lead-search";
import { LeadViewToggle } from "@/features/crm/leads/components/lead-view-toggle";
import { getLeads, getLeadStats } from "@/features/crm/leads/queries";
import {
  leadStatuses,
  type LeadStatus,
} from "@/features/crm/leads/types";

export const metadata: Metadata = { title: "Leads" };

type LeadsPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    status?: string;
    view?: string;
  }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const activeView = params.view === "list" ? "list" : "kanban";
  const query =
    activeView === "list" ? String(params.q ?? "").trim().slice(0, 80) : "";
  const requestedStatus =
    activeView === "list" ? (params.status as LeadStatus) : undefined;
  const status: LeadStatus | "all" =
    requestedStatus && leadStatuses.includes(requestedStatus)
    ? (params.status as LeadStatus)
    : "all";
  const [{ leads, count }, stats] = await Promise.all([
    getLeads({ query, status }),
    getLeadStats(),
  ]);

  return (
    <div className="space-y-6">
      <CrmTabs />

      <PageHeader
        eyebrow="Funil comercial"
        icon={Target}
        tone="violet"
        title="Leads"
        description="Acompanhe cada oportunidade do primeiro contato ao fechamento."
        actions={[{ href: "/crm/leads/novo", icon: Plus, label: "Novo lead" }]}
      />

      <div className="flex justify-end">
        <LeadViewToggle activeView={activeView} />
      </div>

      {params.deleted === "1" && (
        <Notice tone="success">Lead excluido com sucesso.</Notice>
      )}

      {activeView === "kanban" ? (
        <LeadKanban leads={leads} />
      ) : (
        <>
          <LeadPipelineSummary stats={stats} />
          <LeadSearch query={query} status={status} />
          <LeadList
            leads={leads}
            count={count}
            hasFilters={Boolean(query) || status !== "all"}
          />
        </>
      )}
    </div>
  );
}
