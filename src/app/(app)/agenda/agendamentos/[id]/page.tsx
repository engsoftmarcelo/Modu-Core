import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock,
  MapPin,
  Pencil,
  Scissors,
  StickyNote,
  UserRound,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/features/agenda/agendamentos/components/appointment-status-badge";
import { AppointmentStatusSelect } from "@/features/agenda/agendamentos/components/appointment-status-select";
import { CancelAppointmentButton } from "@/features/agenda/agendamentos/components/cancel-appointment-button";
import { DeleteAppointmentButton } from "@/features/agenda/agendamentos/components/delete-appointment-button";
import {
  longDayLabel,
  spDateKey,
  spTime,
} from "@/features/agenda/agendamentos/calendar";
import { getAppointmentById } from "@/features/agenda/agendamentos/queries";
import { formatDuration } from "@/lib/utils";

type AppointmentDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: AppointmentDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  return { title: appointment?.title ?? "Agendamento" };
}

export default async function AppointmentDetailsPage({
  params,
  searchParams,
}: AppointmentDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  const durationMinutes = Math.round(
    (new Date(appointment.ends_at).getTime() -
      new Date(appointment.starts_at).getTime()) /
      60_000,
  );
  const timeRange = `${spTime(appointment.starts_at)} - ${spTime(appointment.ends_at)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href={`/agenda?view=day&date=${spDateKey(appointment.starts_at)}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para a agenda
      </Link>

      {notice.created === "1" || notice.updated === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Agendamento criado com sucesso."
            : "Agendamento atualizado com sucesso."}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <CalendarClock className="size-7" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
                {appointment.title}
              </h1>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <p className="mt-2 capitalize text-slate-500">
              {longDayLabel(spDateKey(appointment.starts_at))} - {timeRange}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {appointment.status !== "cancelled" ? (
            <CancelAppointmentButton
              appointmentId={appointment.id}
              appointmentTitle={appointment.title}
            />
          ) : null}
          <Link
            href={`/agenda/agendamentos/${appointment.id}/editar`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
          >
            <Pencil className="size-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Detalhes</h2>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <DetailItem
                icon={Clock}
                label="Horario"
                value={timeRange}
                hint={formatDuration(durationMinutes)}
              />
              <DetailItem
                icon={MapPin}
                label="Local"
                value={appointment.location || "Nao informado"}
              />
              <DetailLink
                icon={UserRound}
                label="Cliente"
                value={appointment.customerName}
                href={
                  appointment.customer_id
                    ? `/crm/${appointment.customer_id}`
                    : undefined
                }
                fallback="Sem cliente"
              />
              <DetailLink
                icon={Users}
                label="Profissional"
                value={appointment.professionalName}
                href={
                  appointment.professional_id
                    ? `/agenda/profissionais/${appointment.professional_id}`
                    : undefined
                }
                fallback="Sem profissional"
              />
              <DetailLink
                icon={Scissors}
                label="Servico"
                value={appointment.serviceName}
                href={
                  appointment.service_id
                    ? `/agenda/servicos/${appointment.service_id}`
                    : undefined
                }
                fallback="Sem servico"
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
              {appointment.notes || "Nenhuma observacao registrada."}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Andamento</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Atualize o status conforme o atendimento avanca.
            </p>
            <div className="mt-5">
              <AppointmentStatusSelect
                appointmentId={appointment.id}
                appointmentTitle={appointment.title}
                initialStatus={appointment.status}
              />
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cancele para manter o historico ou exclua para remover de vez.
            </p>
            <div className="mt-5">
              <DeleteAppointmentButton
                appointmentId={appointment.id}
                appointmentTitle={appointment.title}
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
  hint?: string;
};

function DetailItem({ icon: Icon, label, value, hint }: DetailItemProps) {
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
          {hint ? (
            <span className="ml-2 font-medium text-slate-400">({hint})</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

type DetailLinkProps = {
  icon: typeof Clock;
  label: string;
  value: string | null;
  href?: string;
  fallback: string;
};

function DetailLink({ icon: Icon, label, value, href, fallback }: DetailLinkProps) {
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
          {value || fallback}
        </p>
      </div>
    </>
  );

  if (href && value) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 bg-white p-5 transition hover:bg-violet-50/50"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 bg-white p-5">{content}</div>;
}
