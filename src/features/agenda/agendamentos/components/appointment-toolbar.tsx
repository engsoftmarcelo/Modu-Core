import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  addDays,
  rangeTitle,
  todayDateKey,
  type CalendarView,
} from "../calendar";

type AppointmentToolbarProps = {
  view: CalendarView;
  dateKey: string;
};

function agendaHref(view: CalendarView, dateKey: string) {
  return `/agenda?view=${view}&date=${dateKey}`;
}

export function AppointmentToolbar({ view, dateKey }: AppointmentToolbarProps) {
  const step = view === "day" ? 1 : 7;
  const previous = addDays(dateKey, -step);
  const next = addDays(dateKey, step);
  const today = todayDateKey();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-slate-200">
          <Link
            href={agendaHref(view, previous)}
            aria-label="Periodo anterior"
            className="grid size-10 place-items-center rounded-l-xl text-slate-500 transition hover:bg-slate-50 hover:text-ink-950"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Link
            href={agendaHref(view, next)}
            aria-label="Proximo periodo"
            className="grid size-10 place-items-center rounded-r-xl border-l border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-ink-950"
          >
            <ChevronRight className="size-5" />
          </Link>
        </div>
        <Link
          href={agendaHref(view, today)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink-950"
        >
          <CalendarDays className="size-4" />
          Hoje
        </Link>
        <p className="ml-1 text-sm font-bold capitalize text-ink-950 sm:text-base">
          {rangeTitle(view, dateKey)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(["day", "week"] as const).map((option) => (
            <Link
              key={option}
              href={agendaHref(option, dateKey)}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-semibold transition",
                view === option
                  ? "bg-ink-950 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-ink-950",
              )}
            >
              {option === "day" ? "Dia" : "Semana"}
            </Link>
          ))}
        </div>
        <Link
          href={`/agenda/agendamentos/novo?date=${dateKey}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          <span className="hidden sm:inline">Novo agendamento</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>
    </div>
  );
}
