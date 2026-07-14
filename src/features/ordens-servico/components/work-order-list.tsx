import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

import type { WorkOrderWithCustomer } from "../types";
import { WorkOrderStatusBadge } from "./work-order-status-badge";

type WorkOrderListProps = {
  count: number;
  workOrders: WorkOrderWithCustomer[];
};

function workOrderCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function WorkOrderList({ count, workOrders }: WorkOrderListProps) {
  if (!workOrders.length) {
    return (
      <Card className="grid min-h-80 place-items-center px-6 py-12 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ClipboardList className="size-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-ink-950">
            Nenhuma ordem encontrada
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Abra a primeira ordem para organizar cliente, visita, tecnico e
            andamento do servico.
          </p>
          <Link
            href="/ordens-servico/novo"
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            Nova ordem
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="font-bold text-ink-950">Ordens de servico</h2>
        <span className="text-sm font-semibold text-slate-400">
          {count} {count === 1 ? "registro" : "registros"}
        </span>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
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
              <p className="mt-1 text-xs font-semibold text-slate-400">
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

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
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
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    OS #{workOrderCode(workOrder.id)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {workOrder.customerName ?? "Cliente removido"}
                  </p>
                  {workOrder.customerCompany ? (
                    <p className="mt-1 text-xs text-slate-400">
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
                    <p className="text-sm font-semibold text-slate-400">
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
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <Link
                      href={`/ordens-servico/${workOrder.id}/editar`}
                      aria-label={`Editar ordem de ${workOrder.service_type}`}
                      title="Editar ordem"
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-ink-950"
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
