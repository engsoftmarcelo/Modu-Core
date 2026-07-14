import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Eye,
  FileText,
  Pencil,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

import type { ProposalWithCustomer } from "../types";
import { ProposalStatusBadge } from "./proposal-status-badge";
import { ProposalStatusSelect } from "./proposal-status-select";

function saoPauloTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date());
}

function isPastDeadline(proposal: ProposalWithCustomer, todayKey: string) {
  return (
    Boolean(proposal.valid_until) &&
    (proposal.valid_until as string) < todayKey &&
    (proposal.status === "draft" || proposal.status === "sent")
  );
}

export function ProposalList({
  count,
  hasFilters = false,
  proposals,
}: {
  count: number;
  hasFilters?: boolean;
  proposals: ProposalWithCustomer[];
}) {
  if (!proposals.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={FileText}
        tone="green"
        emptyTitle="Voce ainda nao criou nenhuma proposta."
        emptyDescription="Crie a primeira proposta para apresentar servicos, valores e prazos de forma profissional."
        filteredTitle="Nenhuma proposta corresponde aos filtros."
        filteredDescription="Revise o titulo ou o status selecionado para ampliar os resultados."
        createHref="/propostas/novo"
        createLabel="Criar primeira proposta"
        clearHref="/propostas"
      />
    );
  }

  const todayKey = saoPauloTodayKey();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "proposta" : "propostas"}
        </p>
        {count > 100 ? (
          <p className="mt-1 text-xs text-slate-500">
            Exibindo as primeiras 100 propostas.
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Proposta</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Valor</th>
              <th className="px-5 py-4">Prazo</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => {
              const pastDeadline = isPastDeadline(proposal, todayKey);

              return (
                <tr
                  key={proposal.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-emerald-50/30"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/propostas/${proposal.id}`}
                      className="font-bold text-ink-950 hover:text-emerald-700"
                    >
                      {proposal.title}
                    </Link>
                    <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
                      {proposal.service_summary || "Servicos nao descritos"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {proposal.customerName ? (
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <UserRound className="size-4 text-brand-600" />
                        {proposal.customerName}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Cliente removido
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-ink-950">
                      {formatCurrency(proposal.total, 2)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarClock className="size-4 text-slate-400" />
                      {proposal.valid_until
                        ? formatDate(proposal.valid_until)
                        : "Sem prazo"}
                    </p>
                    {pastDeadline ? (
                      <Badge tone="red" className="mt-2">
                        <AlertTriangle className="mr-1 size-3" />
                        Prazo vencido
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <ProposalStatusSelect
                      proposalId={proposal.id}
                      proposalTitle={proposal.title}
                      initialStatus={proposal.status}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/propostas/${proposal.id}`}
                        aria-label={`Ver ${proposal.title}`}
                        className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-emerald-700"
                      >
                        <Eye className="size-[18px]" />
                      </Link>
                      <Link
                        href={`/propostas/${proposal.id}/editar`}
                        aria-label={`Editar ${proposal.title}`}
                        className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-emerald-700"
                      >
                        <Pencil className="size-[18px]" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {proposals.map((proposal) => {
          const pastDeadline = isPastDeadline(proposal, todayKey);

          return (
            <Link
              key={proposal.id}
              href={`/propostas/${proposal.id}`}
              className="flex gap-3 p-5 transition hover:bg-emerald-50/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-950">
                  {proposal.title}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {proposal.customerName || "Cliente removido"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ProposalStatusBadge status={proposal.status} />
                  <Badge tone="slate">{formatCurrency(proposal.total, 2)}</Badge>
                  {pastDeadline ? (
                    <Badge tone="red">Prazo vencido</Badge>
                  ) : (
                    <Badge tone="slate">
                      {proposal.valid_until
                        ? formatDate(proposal.valid_until)
                        : "Sem prazo"}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
