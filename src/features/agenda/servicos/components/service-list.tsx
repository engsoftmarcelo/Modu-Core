import Link from "next/link";
import { ChevronRight, Clock, Eye, Pencil, Scissors } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDuration } from "@/lib/utils";

import type { Service } from "../types";
import { ServiceActiveToggle } from "./service-active-toggle";
import { ServiceStatusBadge } from "./service-status-badge";

export function ServiceList({
  services,
  count,
  hasFilters = false,
}: {
  services: Service[];
  count: number;
  hasFilters?: boolean;
}) {
  if (!services.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={Scissors}
        tone="violet"
        emptyTitle="Seu catalogo de servicos ainda esta vazio."
        emptyDescription="Cadastre o primeiro servico com duracao e preco para usa-lo na agenda e nas propostas."
        filteredTitle="Nenhum servico corresponde aos filtros."
        filteredDescription="Revise o nome ou a situacao selecionada para encontrar outros servicos."
        createHref="/agenda/servicos/novo"
        createLabel="Cadastrar primeiro servico"
        clearHref="/agenda/servicos"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "servico" : "servicos"}
        </p>
        {count > 100 ? (
          <p className="mt-1 text-xs text-slate-500">
            Exibindo os primeiros 100 resultados.
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Servico</th>
              <th className="px-5 py-4">Duracao</th>
              <th className="px-5 py-4">Preco</th>
              <th className="px-5 py-4">Situacao</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-violet-50/30"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/agenda/servicos/${service.id}`}
                    className="font-bold text-ink-950 hover:text-violet-700"
                  >
                    {service.name}
                  </Link>
                  <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
                    {service.description || "Sem descricao"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock className="size-4 text-slate-400" />
                    {formatDuration(service.duration_minutes)}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm font-bold text-ink-950">
                  {formatCurrency(service.price, 2)}
                </td>
                <td className="px-5 py-4">
                  <ServiceActiveToggle
                    serviceId={service.id}
                    serviceName={service.name}
                    active={service.active}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/agenda/servicos/${service.id}`}
                      aria-label={`Ver ${service.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/agenda/servicos/${service.id}/editar`}
                      aria-label={`Editar ${service.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Pencil className="size-[18px]" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/agenda/servicos/${service.id}`}
            className="flex gap-3 p-5 transition hover:bg-violet-50/40"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <Scissors className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-bold text-ink-950">{service.name}</p>
                <ServiceStatusBadge active={service.active} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-slate-400" />
                  {formatDuration(service.duration_minutes)}
                </span>
                <span className="text-ink-950">
                  {formatCurrency(service.price, 2)}
                </span>
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
