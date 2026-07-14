import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProposalList } from "@/features/propostas/components/proposal-list";
import { ProposalSearch } from "@/features/propostas/components/proposal-search";
import { ProposalSummary } from "@/features/propostas/components/proposal-summary";
import {
  getProposals,
  getProposalStats,
  isProposalStatus,
} from "@/features/propostas/queries";
import type { ProposalStatus } from "@/features/propostas/types";

export const metadata: Metadata = { title: "Propostas" };

type ProposalsPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function ProposalsPage({
  searchParams,
}: ProposalsPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const status: ProposalStatus | "all" = isProposalStatus(params.status)
    ? params.status
    : "all";
  const [{ proposals, count }, stats] = await Promise.all([
    getProposals({ query, status }),
    getProposalStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">
            <FileText className="mr-1.5 size-3.5" />
            Comercial
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Propostas
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Crie propostas para seus clientes e acompanhe envio, aceite e prazo
            em um so lugar.
          </p>
        </div>

        <Link
          href="/propostas/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Nova proposta
        </Link>
      </div>

      {params.deleted === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Proposta excluida com sucesso.
        </div>
      ) : null}

      <ProposalSummary stats={stats} />
      <ProposalSearch query={query} status={status} />
      <ProposalList
        proposals={proposals}
        count={count}
        hasFilters={Boolean(query) || status !== "all"}
      />
    </div>
  );
}
