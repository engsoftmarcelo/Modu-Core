import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  Pencil,
  Plus,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

import type { CourseClassWithCourse } from "../types";
import { weekdayLabels, type Weekday } from "../types";

function formatWeekdays(values: string[]) {
  return values
    .map((value) => weekdayLabels[value as Weekday] ?? value)
    .join(", ");
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function CourseClassList({
  classes,
  count,
}: {
  classes: CourseClassWithCourse[];
  count: number;
}) {
  if (!classes.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        tone="violet"
        title="Nenhuma turma criada ainda."
        description="Crie a primeira turma para definir professor, datas, horarios, vagas e receber matriculas."
        primaryAction={{
          href: "/matriculas/turmas/novo",
          icon: Plus,
          label: "Criar primeira turma",
        }}
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "turma" : "turmas"}
        </p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <th className="px-6 py-4">Curso</th>
              <th className="px-5 py-4">Professor</th>
              <th className="px-5 py-4">Periodo</th>
              <th className="px-5 py-4">Dias e horario</th>
              <th className="px-5 py-4">Vagas</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((courseClass) => (
              <tr
                key={courseClass.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-violet-50/50"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/matriculas/turmas/${courseClass.id}`}
                    className="font-bold text-ink-950 hover:text-violet-700"
                  >
                    {courseClass.courseName ?? "Curso nao informado"}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {courseClass.teacher}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {formatDate(courseClass.start_date)} ate{" "}
                  {formatDate(courseClass.end_date)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  <p className="font-semibold">{formatWeekdays(courseClass.weekdays)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatTime(courseClass.class_time)}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {courseClass.capacity}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/matriculas/turmas/${courseClass.id}`}
                      aria-label="Ver turma"
                      className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-violet-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/matriculas/turmas/${courseClass.id}/editar`}
                      aria-label="Editar turma"
                      className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-violet-700"
                    >
                      <Pencil className="size-[18px]" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {classes.map((courseClass) => (
          <Link
            key={courseClass.id}
            href={`/matriculas/turmas/${courseClass.id}`}
            className="flex gap-3 p-5 transition hover:bg-violet-50/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <CalendarDays className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-950">
                {courseClass.courseName ?? "Curso nao informado"}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" />
                  {courseClass.teacher}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {formatTime(courseClass.class_time)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UsersRound className="size-3.5" />
                  {courseClass.capacity} vagas
                </span>
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

export { formatTime, formatWeekdays };
