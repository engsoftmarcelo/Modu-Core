import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CheckCircle2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CourseList } from "@/features/matriculas/cursos/components/course-list";
import { CourseSearch } from "@/features/matriculas/cursos/components/course-search";
import { getCourses } from "@/features/matriculas/cursos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = { title: "Cursos" };

type CoursesPageProps = {
  searchParams: Promise<{
    active?: string;
    deleted?: string;
    q?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const active: "active" | "inactive" | "all" =
    params.active === "active" || params.active === "inactive"
      ? params.active
      : "all";
  const { count, courses } = await getCourses({ active, query });

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <BookOpenCheck className="mr-1.5 size-3.5" />
            Cursos
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Cursos
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Cadastre cursos com modalidade, carga horaria e preco para montar
            turmas e matriculas nas proximas etapas.
          </p>
        </div>

        <Link
          href="/matriculas/cursos/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Novo curso
        </Link>
      </div>

      {params.deleted === "1" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Curso excluido com sucesso.
        </div>
      )}

      <CourseSearch query={query} active={active} />
      <CourseList courses={courses} count={count} />
    </div>
  );
}
