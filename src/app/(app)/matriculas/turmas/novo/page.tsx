import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getActiveCourseOptions } from "@/features/matriculas/cursos/queries";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import { getCourseClassDemoDefaults } from "@/features/matriculas/demo/defaults";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { CourseClassForm } from "@/features/matriculas/turmas/components/course-class-form";

export const metadata: Metadata = {
  title: "Nova turma",
};

type NewCourseClassPageProps = {
  searchParams: Promise<{ courseId?: string; demo?: string }>;
};

export default async function NewCourseClassPage({
  searchParams,
}: NewCourseClassPageProps) {
  const [params, courses] = await Promise.all([
    searchParams,
    getActiveCourseOptions(),
  ]);
  const demoMode = params.demo === "1";
  const defaultCourseId = courses.some((course) => course.id === params.courseId)
    ? params.courseId
    : undefined;
  const backHref = demoMode
    ? defaultCourseId
      ? `/matriculas/cursos/${defaultCourseId}?demo=1`
      : "/matriculas/demo"
    : "/matriculas/turmas";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MatriculasTabs />
      {demoMode ? <CourseDemoProgress currentStep={2} /> : null}

      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        {demoMode ? "Voltar para o curso" : "Voltar para turmas"}
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <CalendarPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Nova turma
          </h1>
          <p className="mt-1 text-slate-500">
            Defina curso, professor, calendario, horario e vagas.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <CourseClassForm
          courses={courses}
          defaultCourseId={defaultCourseId}
          demoDefaults={demoMode ? getCourseClassDemoDefaults() : undefined}
          demoMode={demoMode}
          mode="create"
        />
      </Card>
    </div>
  );
}
