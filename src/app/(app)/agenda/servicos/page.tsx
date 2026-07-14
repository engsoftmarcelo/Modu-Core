import type { Metadata } from "next";
import { Plus, Scissors } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
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

      <PageHeader
        eyebrow="Catalogo"
        icon={Scissors}
        tone="violet"
        title="Servicos"
        description="Cadastre duracao e preco dos servicos usados na agenda e nas propostas."
        actions={[{ href: "/agenda/servicos/novo", icon: Plus, label: "Novo servico" }]}
      />

      {params.deleted === "1" ? (
        <Notice tone="success">Servico excluido com sucesso.</Notice>
      ) : null}

      <ServiceSummary stats={stats} />
      <ServiceSearch query={query} situation={situation} />
      <ServiceList
        services={services}
        count={count}
        hasFilters={Boolean(query) || situation !== "all"}
      />
    </div>
  );
}
