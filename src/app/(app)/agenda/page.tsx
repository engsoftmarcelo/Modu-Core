import type { Metadata } from "next";
import { CalendarCheck2, CalendarDays, CalendarPlus2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { AgendaTabs } from "@/features/agenda/agenda-tabs";
import { AppointmentCalendar } from "@/features/agenda/agendamentos/components/appointment-calendar";
import { AppointmentToolbar } from "@/features/agenda/agendamentos/components/appointment-toolbar";
import {
  isCalendarView,
  isValidDateKey,
  todayDateKey,
  type CalendarView,
} from "@/features/agenda/agendamentos/calendar";
import { getAppointmentsInRange } from "@/features/agenda/agendamentos/queries";

export const metadata: Metadata = { title: "Agenda" };

type AgendaPageProps = {
  searchParams: Promise<{
    view?: string;
    date?: string;
    deleted?: string;
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const view: CalendarView = isCalendarView(params.view) ? params.view : "week";
  const dateKey =
    params.date && isValidDateKey(params.date) ? params.date : todayDateKey();

  const { appointments, days } = await getAppointmentsInRange(view, dateKey);
  const active = appointments.filter((item) => item.status !== "cancelled");

  return (
    <div className="space-y-6">
      <AgendaTabs />

      <PageHeader
        eyebrow="Atendimentos"
        icon={CalendarDays}
        tone="violet"
        title="Agenda"
        description="Visualize os horarios, crie e gerencie os agendamentos da equipe."
      />

      {params.deleted === "1" ? (
        <Notice tone="success">Agendamento excluido com sucesso.</Notice>
      ) : null}

      <AppointmentToolbar view={view} dateKey={dateKey} />

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarCheck2 className="size-4 text-violet-600" />
        <span>
          <strong className="font-bold text-ink-950">{active.length}</strong>{" "}
          {active.length === 1 ? "agendamento ativo" : "agendamentos ativos"}
          {view === "day" ? " no dia" : " na semana"}
          {appointments.length - active.length > 0
            ? ` - ${appointments.length - active.length} cancelado(s)`
            : ""}
        </span>
      </div>

      {appointments.length ? (
        <AppointmentCalendar
          view={view}
          days={days}
          appointments={appointments}
        />
      ) : (
        <EmptyState
          icon={CalendarPlus2}
          tone="violet"
          title="Agenda livre neste periodo."
          description={
            view === "day"
              ? "Nao ha atendimentos marcados neste dia. Aproveite o espaco para agendar o proximo cliente."
              : "Nao ha atendimentos marcados nesta semana. Crie o primeiro para comecar a organizar a agenda."
          }
          primaryAction={{
            href: `/agenda/agendamentos/novo?date=${dateKey}`,
            icon: CalendarPlus2,
            label: "Criar agendamento",
          }}
        />
      )}
    </div>
  );
}
