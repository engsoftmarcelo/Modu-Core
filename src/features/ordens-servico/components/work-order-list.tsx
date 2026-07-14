import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  Pencil,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

import type { WorkOrderWithCustomer } from "../types";
import { WorkOrderStatusBadge } from "./work-order-status-badge";

type WorkOrderListProps = {
  count: number;
  hasFilters?: boolean;
  workOrders: WorkOrderWithCustomer[];
};

function workOrderCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function WorkOrderList({
  count,
  hasFilters = false,
  workOrders,
}: WorkOrderListProps) {
  if (!workOrders.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={ClipboardList}
        tone="green"
        emptyTitle="Voce ainda nao criou nenhuma ordem de servico."
        emptyDescription="Abra a primeira ordem para organizar cliente, visita, tecnico e andamento do servico."
        filteredTitle="Nenhuma ordem corresponde aos filtros."
        filteredDescription="Revise o servico, endereco, tecnico ou status para ampliar os resultados."
        createHref="/ordens-servico/novo"
        createLabel="Criar primeira ordem"
        clearHref="/ordens-servico"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="font-bold text-ink-950">Ordens de servico</h2>
        <span className="text-sm font-semibold text-slate-500">
          {count} {count === 1 ? "registro" : "registros"}
        </span>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {workOrders.map((workOrder) => (
          <Link
            key={workOrder.id}
            href={`/ordens-servico/${workOrder.id}`}
            className="flex items-center gap-4 p-5 transition hover:bg-emerald-50/40"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ClipboardList className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-bold text-ink-950">
                  {workOrder.service_type}
                </p>
                <WorkOrderStatusBadge status={workOrder.status} />
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">
                {workOrder.customerName ?? "Cliente removido"}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {formatDate(workOrder.visit_date)} - {workOrder.technician_name}
              </p>
              {workOrder.quoted_at ? (
                <p className="mt-1 text-xs font-bold text-emerald-700">
                  Orcamento {formatCurrency(workOrder.quote_total, 2)}
                </p>
              ) : null}
            </div>
            <ArrowRight className="size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Ordem</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Tecnico</th>
              <th className="px-6 py-3">Visita</th>
              <th className="px-6 py-3">Orcamento</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workOrders.map((workOrder) => (
              <tr key={workOrder.id} className="transition hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <Link
                    href={`/ordens-servico/${workOrder.id}`}
                    className="font-bold text-ink-950 hover:text-emerald-700"
                  >
                    {workOrder.service_type}
                  </Link>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    OS #{workOrderCode(workOrder.id)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {workOrder.customerName ?? "Cliente removido"}
                  </p>
                  {workOrder.customerCompany ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {workOrder.customerCompany}
                    </p>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {workOrder.technician_name}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                  {formatDate(workOrder.visit_date)}
                </td>
                <td className="px-6 py-4">
                  {workOrder.quoted_at ? (
                    <p className="text-sm font-bold tabular-nums text-ink-950">
                      {formatCurrency(workOrder.quote_total, 2)}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">
                      Pendente
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <WorkOrderStatusBadge status={workOrder.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/ordens-servico/${workOrder.id}`}
                      aria-label={`Ver ordem de ${workOrder.service_type}`}
                      title="Ver ordem"
                      className="grid size-11 place-items-center rounded-xl text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <Link
                      href={`/ordens-servico/${workOrder.id}/editar`}
                      aria-label={`Editar ordem de ${workOrder.service_type}`}
                      title="Editar ordem"
                      className="grid size-11 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-ink-950"
                    >
                      <Pencil className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
