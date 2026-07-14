import Link from "next/link";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  workOrderStatusLabels,
  workOrderStatuses,
  type WorkOrderStatus,
} from "../types";

type WorkOrderSearchProps = {
  query: string;
  status: WorkOrderStatus | "all";
};

export function WorkOrderSearch({ query, status }: WorkOrderSearchProps) {
  const hasFilters = Boolean(query) || status !== "all";

  return (
    <form
      action="/ordens-servico"
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto_auto] md:items-center"
    >
      <label className="relative">
        <span className="sr-only">Buscar ordens</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
        <input
          name="query"
          defaultValue={query}
          maxLength={80}
          placeholder="Servico, endereco ou tecnico"
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-11 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>

      <label>
        <span className="sr-only">Filtrar por status</span>
        <select
          name="status"
          defaultValue={status}
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="all">Todos os status</option>
          {workOrderStatuses.map((workOrderStatus) => (
            <option key={workOrderStatus} value={workOrderStatus}>
              {workOrderStatusLabels[workOrderStatus]}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" className="w-full md:w-auto">
        <Search className="size-4" />
        Filtrar
      </Button>

      {hasFilters ? (
        <Link
          href="/ordens-servico"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-ink-950"
        >
          <X className="size-4" />
          Limpar
        </Link>
      ) : null}
    </form>
  );
}
