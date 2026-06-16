import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Plus, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <UsersRound className="mr-1.5 size-3.5" />
            Equipe
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Profissionais
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Cadastre quem realiza os atendimentos, suas especialidades e os
            servicos que cada um executa.
          </p>
        </div>

        <Link
          href="/agenda/profissionais/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Novo profissional
        </Link>
      </div>

      {params.deleted === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Profissional excluido com sucesso.
        </div>
      ) : null}

      <ProfessionalSummary stats={stats} />
      <ProfessionalSearch query={query} situation={situation} />
      <ProfessionalList professionals={professionals} count={count} />
    </div>
  );
}
