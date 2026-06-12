import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Mail,
  ListPlus,
  Pencil,
  Phone,
  StickyNote,
  Target,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { DeleteLeadButton } from "@/features/crm/leads/components/delete-lead-button";
import { LeadStatusBadge } from "@/features/crm/leads/components/lead-status-badge";
import { getLeadById } from "@/features/crm/leads/queries";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";

type LeadDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: LeadDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadById(id);

  return {
    title: lead?.name ?? "Lead",
  };
}

export default async function LeadDetailsPage({
  params,
  searchParams,
}: LeadDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CrmTabs />

      <Link
        href="/crm/leads"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para leads
      </Link>

      {(notice.created === "1" || notice.updated === "1") && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Lead criado com sucesso."
            : "Lead atualizado com sucesso."}
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
            {getInitials(lead.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
                {lead.name}
              </h1>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-slate-500">
              <Building2 className="size-4" />
              {lead.company || "Empresa nao informada"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/tarefas/novo?leadId=${lead.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
          >
            <ListPlus className="size-4" />
            Criar follow-up
          </Link>
          <Link
            href={`/crm/leads/${lead.id}/editar`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
          >
            <Pencil className="size-4" />
            Editar lead
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Informacoes comerciais</h2>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <InfoItem
                icon={CircleDollarSign}
                label="Valor estimado"
                value={formatCurrency(lead.estimated_value)}
              />
              <InfoItem
                icon={Target}
                label="Origem"
                value={lead.source || "Nao informada"}
              />
              <InfoItem
                icon={Phone}
                label="Telefone"
                value={lead.phone || "Nao informado"}
                href={lead.phone ? `tel:${lead.phone}` : undefined}
              />
              <InfoItem
                icon={Mail}
                label="E-mail"
                value={lead.email || "Nao informado"}
                href={lead.email ? `mailto:${lead.email}` : undefined}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <StickyNote className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Observacoes</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {lead.notes || "Nenhuma observacao registrada."}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Registro</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <UserRound className="mt-0.5 size-5 text-violet-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Responsavel
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    Usuario atual
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-brand-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Criado em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(lead.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Ultima atualizacao
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(lead.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A exclusao remove a oportunidade e desvincula suas tarefas.
            </p>
            <div className="mt-5">
              <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type InfoItemProps = {
  href?: string;
  icon: typeof Phone;
  label: string;
  value: string;
};

function InfoItem({ href, icon: Icon, label, value }: InfoItemProps) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-950">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 bg-white p-5 transition hover:bg-violet-50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3 bg-white p-5">{content}</div>;
}
