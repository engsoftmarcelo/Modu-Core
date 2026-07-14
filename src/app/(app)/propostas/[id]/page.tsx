import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  FileText,
  ListPlus,
  Pencil,
  StickyNote,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeleteProposalButton } from "@/features/propostas/components/delete-proposal-button";
import { ProposalStatusBadge } from "@/features/propostas/components/proposal-status-badge";
import { ProposalStatusSelect } from "@/features/propostas/components/proposal-status-select";
import { getProposalById } from "@/features/propostas/queries";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

type ProposalDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: ProposalDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const proposal = await getProposalById(id);

  return { title: proposal?.title ?? "Proposta" };
}

function saoPauloTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date());
}

export default async function ProposalDetailsPage({
  params,
  searchParams,
}: ProposalDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const proposal = await getProposalById(id);

  if (!proposal) {
    notFound();
  }

  const pastDeadline =
    Boolean(proposal.valid_until) &&
    (proposal.valid_until as string) < saoPauloTodayKey() &&
    (proposal.status === "draft" || proposal.status === "sent");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/propostas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para propostas
      </Link>

      {notice.created === "1" || notice.updated === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Proposta criada com sucesso."
            : "Proposta atualizada com sucesso."}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <FileText className="size-7" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-ink-950 sm:text-4xl">
                {proposal.title}
              </h1>
              <ProposalStatusBadge status={proposal.status} />
              {pastDeadline ? (
                <Badge tone="red">
                  <AlertTriangle className="mr-1 size-3" />
                  Prazo vencido
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-slate-500">
              {formatCurrency(proposal.total, 2)}
              {proposal.valid_until
                ? ` - valida ate ${formatDate(proposal.valid_until)}`
                : " - sem prazo definido"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {proposal.customer_id ? (
            <Link
              href={`/tarefas/novo?customerId=${proposal.customer_id}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
            >
              <ListPlus className="size-4" />
              Criar follow-up
            </Link>
          ) : null}
          <Link
            href={`/propostas/${proposal.id}/editar`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Pencil className="size-4" />
            Editar proposta
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Briefcase className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Servicos</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {proposal.service_summary || "Nenhum servico descrito."}
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <StickyNote className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Observacoes</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {proposal.notes || "Nenhuma observacao registrada."}
            </p>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Cliente</h2>
            </div>
            {proposal.customer_id && proposal.customerName ? (
              <Link
                href={`/crm/${proposal.customer_id}`}
                className="flex items-center gap-3 p-5 transition hover:bg-emerald-50/40 sm:p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <UserRound className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Cliente
                  </p>
                  <p className="mt-1 font-bold text-ink-950">
                    {proposal.customerName}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="p-5 text-sm text-slate-500 sm:p-6">
                O cliente desta proposta foi removido da base.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Andamento</h2>
            <div className="mt-5">
              <ProposalStatusSelect
                proposalId={proposal.id}
                proposalTitle={proposal.title}
                initialStatus={proposal.status}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Resumo</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <CircleDollarSign className="mt-0.5 size-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Valor
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatCurrency(proposal.total, 2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-amber-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Prazo de validade
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {proposal.valid_until
                      ? formatDate(proposal.valid_until)
                      : "Nao definido"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-slate-500" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Criada em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(proposal.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A exclusao remove esta proposta definitivamente.
            </p>
            <div className="mt-5">
              <DeleteProposalButton
                proposalId={proposal.id}
                proposalTitle={proposal.title}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
