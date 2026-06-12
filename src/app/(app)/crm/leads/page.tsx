import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Plus, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <Target className="mr-1.5 size-3.5" />
            Funil comercial
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Leads
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Acompanhe cada oportunidade do primeiro contato ao fechamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LeadViewToggle activeView={activeView} />
          <Link
            href="/crm/leads/novo"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
          >
            <Plus className="size-5" />
            Novo lead
          </Link>
        </div>
      </div>

      {params.deleted === "1" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Lead excluido com sucesso.
        </div>
      )}

      {activeView === "kanban" ? (
        <LeadKanban leads={leads} />
      ) : (
        <>
          <LeadPipelineSummary stats={stats} />
          <LeadSearch query={query} status={status} />
          <LeadList leads={leads} count={count} />
        </>
      )}
    </div>
  );
}
