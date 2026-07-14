import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { CourseClassList } from "@/features/matriculas/turmas/components/course-class-list";
import { getCourseClasses } from "@/features/matriculas/turmas/queries";

export const metadata: Metadata = { title: "Turmas" };

export default async function CourseClassesPage() {
  const { classes, count } = await getCourseClasses();

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <CalendarDays className="mr-1.5 size-3.5" />
            Turmas
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Turmas
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Organize curso, professor, periodo, dias, horario e vagas para
            demonstrar a operacao de cursos livres.
          </p>
        </div>

        <Link
          href="/matriculas/turmas/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Nova turma
        </Link>
      </div>

      <CourseClassList classes={classes} count={count} />
    </div>
  );
}
