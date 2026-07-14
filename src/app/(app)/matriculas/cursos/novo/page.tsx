import type { Metadata } from "next";
import Link from "next/link";
import { BookPlus, ChevronLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseForm } from "@/features/matriculas/cursos/components/course-form";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = {
  title: "Novo curso",
};

type NewCoursePageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function NewCoursePage({
  searchParams,
}: NewCoursePageProps) {
  const params = await searchParams;
  const demoMode = params.demo === "1";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MatriculasTabs />
      {demoMode ? <CourseDemoProgress currentStep={1} /> : null}

      <Link
        href={demoMode ? "/matriculas/demo" : "/matriculas/cursos"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        {demoMode ? "Voltar para a demo" : "Voltar para cursos"}
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <BookPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Novo curso
          </h1>
          <p className="mt-1 text-slate-500">
            Preencha o curso para usar em turmas, matriculas e certificados.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <CourseForm demoMode={demoMode} mode="create" />
      </Card>
    </div>
  );
}
