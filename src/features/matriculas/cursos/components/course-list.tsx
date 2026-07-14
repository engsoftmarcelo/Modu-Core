import Link from "next/link";
import { BookOpenCheck, ChevronRight, Clock3, Eye, Pencil, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { courseModalityLabels, type Course } from "../types";
import { CourseActiveBadge } from "./course-active-badge";

export function CourseList({
  count,
  courses,
}: {
  count: number;
  courses: Course[];
}) {
  if (!courses.length) {
    return (
      <Card className="grid min-h-80 place-items-center px-6 py-12 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <BookOpenCheck className="size-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-ink-950">
            Nenhum curso encontrado
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Cadastre o primeiro curso para montar turmas e vender a demo.
          </p>
          <Link
            href="/matriculas/cursos/novo"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Cadastrar curso
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "curso" : "cursos"}
        </p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Curso</th>
              <th className="px-5 py-4">Carga</th>
              <th className="px-5 py-4">Preco</th>
              <th className="px-5 py-4">Modalidade</th>
              <th className="px-5 py-4">Situacao</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-violet-50/50"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/matriculas/cursos/${course.id}`}
                    className="font-bold text-ink-950 hover:text-violet-700"
                  >
                    {course.name}
                  </Link>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                    {course.description || "Sem descricao"}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {course.workload_hours}h
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {formatCurrency(course.price)}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {courseModalityLabels[course.modality]}
                </td>
                <td className="px-5 py-4">
                  <CourseActiveBadge active={course.active} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/matriculas/cursos/${course.id}`}
                      aria-label={`Ver ${course.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/matriculas/cursos/${course.id}/editar`}
                      aria-label={`Editar ${course.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
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
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/matriculas/cursos/${course.id}`}
            className="flex gap-3 p-5 transition hover:bg-violet-50/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <BookOpenCheck className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-bold text-ink-950">{course.name}</p>
                <CourseActiveBadge active={course.active} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {course.workload_hours}h
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="size-3.5" />
                  {formatCurrency(course.price)}
                </span>
                <span>{courseModalityLabels[course.modality]}</span>
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
