import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        eyebrow="Comercial"
        icon={FileText}
        tone="green"
        title="Propostas"
        description="Crie propostas e acompanhe envio, aceite e prazo em um so lugar."
        actions={[{ href: "/propostas/novo", icon: Plus, label: "Nova proposta" }]}
      />

      {params.deleted === "1" ? (
        <Notice tone="success">Proposta excluida com sucesso.</Notice>
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
