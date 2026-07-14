import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseForm } from "@/features/matriculas/cursos/components/course-form";
import { getCourseById } from "@/features/matriculas/cursos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditCoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);

  return {
    title: course ? `Editar ${course.name}` : "Editar curso",
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MatriculasTabs />

      <Link
        href={`/matriculas/cursos/${course.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o curso
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar curso
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize os dados de {course.name}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <CourseForm mode="edit" course={course} />
      </Card>
    </div>
  );
}
