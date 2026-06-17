import type { Metadata } from "next";
import { CalendarCheck2, CheckCircle2 } from "lucide-react";

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

      <div>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
          Agenda
        </h1>
        <p className="mt-2 text-slate-500">
          Visualize os horarios, crie e gerencie os agendamentos da equipe.
        </p>
      </div>

      {params.deleted === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Agendamento excluido com sucesso.
        </div>
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

      <AppointmentCalendar view={view} days={days} appointments={appointments} />
    </div>
  );
}
