import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  Pencil,
  Scissors,
  StickyNote,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { DeleteServiceButton } from "@/features/agenda/servicos/components/delete-service-button";
import { ServiceActiveToggle } from "@/features/agenda/servicos/components/service-active-toggle";
import { ServiceStatusBadge } from "@/features/agenda/servicos/components/service-status-badge";
import { getServiceById } from "@/features/agenda/servicos/queries";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/utils";

type ServiceDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: ServiceDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);

  return { title: service?.name ?? "Servico" };
}

export default async function ServiceDetailsPage({
  params,
  searchParams,
}: ServiceDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/agenda/servicos"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para servicos
      </Link>

      {notice.created === "1" || notice.updated === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Servico criado com sucesso."
            : "Servico atualizado com sucesso."}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <Scissors className="size-7" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
                {service.name}
              </h1>
              <ServiceStatusBadge active={service.active} />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatDuration(service.duration_minutes)}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink-950">
                <CircleDollarSign className="size-4 text-emerald-600" />
                {formatCurrency(service.price, 2)}
              </span>
            </p>
          </div>
        </div>

        <Link
          href={`/agenda/servicos/${service.id}/editar`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Pencil className="size-4" />
          Editar servico
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <StickyNote className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Descricao</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {service.description || "Nenhuma descricao registrada."}
            </p>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Detalhes</h2>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <DetailItem
                icon={Clock}
                label="Duracao"
                value={formatDuration(service.duration_minutes)}
              />
              <DetailItem
                icon={CircleDollarSign}
                label="Preco"
                value={formatCurrency(service.price, 2)}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Situacao</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Servicos inativos nao aparecem para novos agendamentos.
            </p>
            <div className="mt-5">
              <ServiceActiveToggle
                serviceId={service.id}
                serviceName={service.name}
                active={service.active}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Registro</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-violet-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Criado em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(service.created_at)}
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
                    {formatDateTime(service.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A exclusao remove este servico definitivamente.
            </p>
            <div className="mt-5">
              <DeleteServiceButton
                serviceId={service.id}
                serviceName={service.name}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type DetailItemProps = {
  icon: typeof Clock;
  label: string;
  value: string;
};

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3 bg-white p-5">
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
    </div>
  );
}
