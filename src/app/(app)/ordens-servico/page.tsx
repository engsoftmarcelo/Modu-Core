import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardList, PlayCircle, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">
            <ClipboardList className="mr-1.5 size-3.5" />
            Equipe externa
          </Badge>
          <h1 className="mt-4 text-3xl font-bold text-ink-950 sm:text-4xl">
            Ordens de servico
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Organize visitas, responsaveis e andamento dos servicos de campo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link
            href="/ordens-servico/demo"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 sm:px-5"
          >
            <PlayCircle className="size-5" />
            Demo guiada
          </Link>
          <Link
            href="/ordens-servico/novo"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700 sm:px-6 sm:text-base"
          >
            <Plus className="size-5" />
            Nova ordem
          </Link>
        </div>
      </div>

      {params.deleted === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Ordem excluida com sucesso.
        </div>
      ) : null}

      <WorkOrderSearch query={query} status={status} />
      <WorkOrderList workOrders={workOrders} count={count} />
    </div>
  );
}
