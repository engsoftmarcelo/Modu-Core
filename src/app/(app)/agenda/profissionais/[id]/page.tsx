import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Pencil,
  Scissors,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { DeleteProfessionalButton } from "@/features/agenda/profissionais/components/delete-professional-button";
import { ProfessionalActiveToggle } from "@/features/agenda/profissionais/components/professional-active-toggle";
import { ProfessionalStatusBadge } from "@/features/agenda/profissionais/components/professional-status-badge";
import { getProfessionalById } from "@/features/agenda/profissionais/queries";
import { formatDateTime, getInitials } from "@/lib/utils";

type ProfessionalDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: ProfessionalDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const professional = await getProfessionalById(id);

  return { title: professional?.name ?? "Profissional" };
}

export default async function ProfessionalDetailsPage({
  params,
  searchParams,
}: ProfessionalDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const professional = await getProfessionalById(id);

  if (!professional) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/agenda/profissionais"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para profissionais
      </Link>

      {notice.created === "1" || notice.updated === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Profissional criado com sucesso."
            : "Profissional atualizado com sucesso."}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
            {getInitials(professional.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
                {professional.name}
              </h1>
              <ProfessionalStatusBadge active={professional.active} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-slate-500">
              <BadgeCheck className="size-4" />
              {professional.specialty || "Especialidade nao informada"}
            </p>
          </div>
        </div>

        <Link
          href={`/agenda/profissionais/${professional.id}/editar`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Pencil className="size-4" />
          Editar profissional
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <Clock className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Horario disponivel</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {professional.available_hours || "Nenhum horario informado."}
            </p>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Servicos que realiza</h2>
              <span className="text-sm font-semibold text-slate-400">
                {professional.services.length}
              </span>
            </div>
            {professional.services.length ? (
              <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
                {professional.services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/agenda/servicos/${service.id}`}
                    className="flex items-center gap-3 bg-white p-4 transition hover:bg-violet-50/50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
                      <Scissors className="size-5" />
                    </span>
                    <span className="min-w-0 truncate font-semibold text-ink-950">
                      {service.name}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="p-5 text-sm text-slate-500 sm:p-6">
                Nenhum servico vinculado a este profissional.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Situacao</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Profissionais inativos nao recebem novos agendamentos.
            </p>
            <div className="mt-5">
              <ProfessionalActiveToggle
                professionalId={professional.id}
                professionalName={professional.name}
                active={professional.active}
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
                    {formatDateTime(professional.created_at)}
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
                    {formatDateTime(professional.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A exclusao remove este profissional e seus vinculos com servicos.
            </p>
            <div className="mt-5">
              <DeleteProfessionalButton
                professionalId={professional.id}
                professionalName={professional.name}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
