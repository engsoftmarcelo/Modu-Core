import type { Metadata } from "next";
import { Plus, UsersRound } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { AgendaTabs } from "@/features/agenda/agenda-tabs";
import { ProfessionalList } from "@/features/agenda/profissionais/components/professional-list";
import { ProfessionalSearch } from "@/features/agenda/profissionais/components/professional-search";
import { ProfessionalSummary } from "@/features/agenda/profissionais/components/professional-summary";
import {
  getProfessionals,
  getProfessionalStats,
  isProfessionalFilter,
} from "@/features/agenda/profissionais/queries";
import type { ProfessionalFilter } from "@/features/agenda/profissionais/types";

export const metadata: Metadata = { title: "Profissionais" };

type ProfessionalsPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    situation?: string;
  }>;
};

export default async function ProfessionalsPage({
  searchParams,
}: ProfessionalsPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const situation: ProfessionalFilter = isProfessionalFilter(params.situation)
    ? params.situation
    : "all";
  const [{ professionals, count }, stats] = await Promise.all([
    getProfessionals({ query, situation }),
    getProfessionalStats(),
  ]);

  return (
    <div className="space-y-6">
      <AgendaTabs />

      <PageHeader
        eyebrow="Equipe"
        icon={UsersRound}
        tone="violet"
        title="Profissionais"
        description="Cadastre quem atende, suas especialidades e os servicos que cada profissional executa."
        actions={[{ href: "/agenda/profissionais/novo", icon: Plus, label: "Novo profissional" }]}
      />

      {params.deleted === "1" ? (
        <Notice tone="success">Profissional excluido com sucesso.</Notice>
      ) : null}

      <ProfessionalSummary stats={stats} />
      <ProfessionalSearch query={query} situation={situation} />
      <ProfessionalList
        professionals={professionals}
        count={count}
        hasFilters={Boolean(query) || situation !== "all"}
      />
    </div>
  );
}
