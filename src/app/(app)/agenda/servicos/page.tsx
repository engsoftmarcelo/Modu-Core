import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Plus, Scissors } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AgendaTabs } from "@/features/agenda/agenda-tabs";
import { ServiceList } from "@/features/agenda/servicos/components/service-list";
import { ServiceSearch } from "@/features/agenda/servicos/components/service-search";
import { ServiceSummary } from "@/features/agenda/servicos/components/service-summary";
import {
  getServices,
  getServiceStats,
  isServiceFilter,
} from "@/features/agenda/servicos/queries";
import type { ServiceFilter } from "@/features/agenda/servicos/types";

export const metadata: Metadata = { title: "Servicos" };

type ServicesPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    situation?: string;
  }>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const situation: ServiceFilter = isServiceFilter(params.situation)
    ? params.situation
    : "all";
  const [{ services, count }, stats] = await Promise.all([
    getServices({ query, situation }),
    getServiceStats(),
  ]);

  return (
    <div className="space-y-6">
      <AgendaTabs />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <Scissors className="mr-1.5 size-3.5" />
            Catalogo
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Servicos
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Cadastre os servicos do seu negocio com duracao e preco para usar na
            agenda e nas propostas.
          </p>
        </div>

        <Link
          href="/agenda/servicos/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Novo servico
        </Link>
      </div>

      {params.deleted === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Servico excluido com sucesso.
        </div>
      ) : null}

      <ServiceSummary stats={stats} />
      <ServiceSearch query={query} situation={situation} />
      <ServiceList services={services} count={count} />
    </div>
  );
}
