import type { Metadata } from "next";
import { ClipboardList, PlayCircle, Plus } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { WorkOrderList } from "@/features/ordens-servico/components/work-order-list";
import { WorkOrderSearch } from "@/features/ordens-servico/components/work-order-search";
import {
  getWorkOrders,
  isWorkOrderStatus,
} from "@/features/ordens-servico/queries";

export const metadata: Metadata = { title: "Ordens de servico" };

type WorkOrdersPageProps = {
  searchParams: Promise<{
    deleted?: string;
    query?: string;
    status?: string;
  }>;
};

export default async function WorkOrdersPage({
  searchParams,
}: WorkOrdersPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const status = isWorkOrderStatus(params.status) ? params.status : "all";
  const { workOrders, count } = await getWorkOrders({ query, status });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Equipe externa"
        icon={ClipboardList}
        tone="green"
        title="Ordens de servico"
        description="Organize visitas, responsaveis e andamento dos servicos de campo."
        actions={[
          {
            href: "/ordens-servico/demo",
            icon: PlayCircle,
            label: "Demo guiada",
            variant: "secondary",
          },
          { href: "/ordens-servico/novo", icon: Plus, label: "Nova ordem" },
        ]}
      />

      {params.deleted === "1" ? (
        <Notice tone="success">Ordem excluida com sucesso.</Notice>
      ) : null}

      <WorkOrderSearch query={query} status={status} />
      <WorkOrderList
        workOrders={workOrders}
        count={count}
        hasFilters={Boolean(query) || status !== "all"}
      />
    </div>
  );
}
