import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  GRID_HEIGHT,
  HOUR_HEIGHT,
  DAY_START_HOUR,
  dayHeader,
  hourMarks,
  layoutDay,
  spDateKey,
  spMinutes,
  spTime,
  type CalendarView,
} from "../calendar";
import type { AppointmentStatus, AppointmentWithRelations } from "../types";

type AppointmentCalendarProps = {
  view: CalendarView;
  days: string[];
  appointments: AppointmentWithRelations[];
};

const blockTones: Record<AppointmentStatus, string> = {
  scheduled: "border-brand-200 bg-brand-50 text-brand-900 hover:bg-brand-100",
  confirmed:
    "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
  cancelled: "border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-200",
};

function DayColumn({
  appointments,
}: {
  appointments: AppointmentWithRelations[];
}) {
  const blocks = layoutDay(
    appointments.map((appointment) => ({
      startMinutes: spMinutes(appointment.starts_at),
      endMinutes: spMinutes(appointment.ends_at),
      data: appointment,
    })),
  );

  return (
    <div className="relative" style={{ height: GRID_HEIGHT }}>
      {hourMarks.map((hour) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-slate-100"
          style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
        />
      ))}

      {blocks.map(({ data, top, height, lane, lanes }) => {
        const sub = [data.customerName, data.professionalName]
          .filter(Boolean)
          .join(" - ");
        const cancelled = data.status === "cancelled";

        return (
          <Link
            key={data.id}
            href={`/agenda/agendamentos/${data.id}`}
            className="absolute p-[2px]"
            style={{
              top,
              height,
              left: `${(lane / lanes) * 100}%`,
              width: `${(1 / lanes) * 100}%`,
            }}
          >
            <div
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-lg border px-2 py-1 text-left shadow-sm transition",
                blockTones[data.status],
              )}
            >
              <p className="text-[11px] font-bold leading-tight">
                {spTime(data.starts_at)}
              </p>
              <p
                className={cn(
                  "truncate text-xs font-bold leading-tight",
                  cancelled && "line-through",
                )}
              >
                {data.title}
              </p>
              {sub && height > 44 ? (
                <p className="mt-0.5 truncate text-[11px] font-medium opacity-80">
                  {sub}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function AppointmentCalendar({
  view,
  days,
  appointments,
}: AppointmentCalendarProps) {
  const byDay = new Map<string, AppointmentWithRelations[]>();
  for (const appointment of appointments) {
    const key = spDateKey(appointment.starts_at);
    const current = byDay.get(key) ?? [];
    current.push(appointment);
    byDay.set(key, current);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className={cn(view === "week" && "min-w-[760px]")}>
          {/* Cabecalho com os dias */}
          <div className="flex border-b border-slate-200">
            <div className="w-16 shrink-0 border-r border-slate-200" />
            <div
              className="grid flex-1"
              style={{
                gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
              }}
            >
              {days.map((day) => {
                const header = dayHeader(day);

                return (
                  <Link
                    key={day}
                    href={`/agenda?view=day&date=${day}`}
                    className={cn(
                      "flex flex-col items-center gap-0.5 border-l border-slate-200 px-2 py-3 text-center transition hover:bg-slate-50 first:border-l-0",
                      header.isWeekend && "bg-slate-50/60",
                    )}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {header.weekdayShort}
                    </span>
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-full text-sm font-bold",
                        header.isToday
                          ? "bg-ink-950 text-white"
                          : "text-ink-950",
                      )}
                    >
                      {header.dayNumber}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Grade de horarios */}
          <div className="flex">
            <div className="relative w-16 shrink-0 border-r border-slate-200">
              <div style={{ height: GRID_HEIGHT }}>
                {hourMarks.map((hour) => (
                  <div
                    key={hour}
                    className="absolute right-2 -translate-y-1/2 text-[11px] font-semibold text-slate-400"
                    style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
            </div>

            <div
              className="grid flex-1"
              style={{
                gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
              }}
            >
              {days.map((day) => {
                const header = dayHeader(day);

                return (
                  <div
                    key={day}
                    className={cn(
                      "group relative border-l border-slate-200 first:border-l-0",
                      header.isWeekend && "bg-slate-50/40",
                    )}
                  >
                    <DayColumn appointments={byDay.get(day) ?? []} />
                    <Link
                      href={`/agenda/agendamentos/novo?date=${day}`}
                      aria-label={`Novo agendamento em ${day}`}
                      className="absolute bottom-2 right-2 hidden size-8 place-items-center rounded-full bg-ink-950 text-white opacity-0 shadow-md transition group-hover:opacity-100 lg:grid"
                    >
                      <Plus className="size-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
