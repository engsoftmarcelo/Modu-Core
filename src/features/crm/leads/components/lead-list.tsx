import Link from "next/link";
import {
  Building2,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Mail,
  Pencil,
  Phone,
  Target,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { formatCurrency, getInitials } from "@/lib/utils";

import type { Lead } from "../types";
import { LeadStatusBadge } from "./lead-status-badge";

export function LeadList({
  leads,
  count,
  hasFilters = false,
}: {
  leads: Lead[];
  count: number;
  hasFilters?: boolean;
}) {
  if (!leads.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={Target}
        tone="violet"
        emptyTitle="Seu funil ainda esta vazio."
        emptyDescription="Cadastre o primeiro lead para acompanhar contatos, propostas e negociacoes desde o inicio."
        filteredTitle="Nenhum lead corresponde aos filtros."
        filteredDescription="Tente outro nome, origem ou etapa do funil para encontrar a oportunidade que procura."
        createHref="/crm/leads/novo"
        createLabel="Cadastrar primeiro lead"
        clearHref="/crm/leads?view=list"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div>
          <p className="font-bold text-ink-950">
            {count} {count === 1 ? "lead" : "leads"}
          </p>
          {count > 100 && (
            <p className="mt-1 text-xs text-slate-500">
              Exibindo os primeiros 100 resultados.
            </p>
          )}
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Lead</th>
              <th className="px-5 py-4">Contato</th>
              <th className="px-5 py-4">Origem</th>
              <th className="px-5 py-4">Valor</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-violet-50/40"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                      {getInitials(lead.name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/crm/leads/${lead.id}`}
                        className="font-bold text-ink-950 hover:text-violet-700"
                      >
                        {lead.name}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                        <Building2 className="size-3.5" />
                        {lead.company || "Sem empresa"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    {lead.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="size-3.5 text-slate-400" />
                        {lead.email}
                      </p>
                    )}
                    {lead.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="size-3.5 text-slate-400" />
                        {lead.phone}
                      </p>
                    )}
                    {!lead.email && !lead.phone && (
                      <span className="text-slate-400">Sem contato</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  {lead.source || "Nao informada"}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-ink-950">
                  {formatCurrency(lead.estimated_value)}
                </td>
                <td className="px-5 py-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      aria-label={`Ver ${lead.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/crm/leads/${lead.id}/editar`}
                      aria-label={`Editar ${lead.name}`}
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
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/crm/leads/${lead.id}`}
            className="flex gap-3 p-5 transition hover:bg-violet-50/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
              {getInitials(lead.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-950">{lead.name}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {lead.company || "Sem empresa"}
                  </p>
                </div>
                <LeadStatusBadge status={lead.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CircleDollarSign className="size-3.5" />
                  {formatCurrency(lead.estimated_value)}
                </span>
                {lead.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {lead.phone}
                  </span>
                )}
                {lead.source && (
                  <span className="inline-flex items-center gap-1.5">
                    <Target className="size-3.5" />
                    {lead.source}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
