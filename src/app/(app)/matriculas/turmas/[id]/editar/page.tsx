import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getActiveCourseOptions } from "@/features/matriculas/cursos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { CourseClassForm } from "@/features/matriculas/turmas/components/course-class-form";
import { getCourseClassById } from "@/features/matriculas/turmas/queries";

type EditCourseClassPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditCourseClassPageProps): Promise<Metadata> {
  const { id } = await params;
  const courseClass = await getCourseClassById(id);

  return {
    title: courseClass?.courseName
      ? `Editar turma de ${courseClass.courseName}`
      : "Editar turma",
  };
}

export default async function EditCourseClassPage({
  params,
}: EditCourseClassPageProps) {
  const { id } = await params;
  const [courseClass, courses] = await Promise.all([
    getCourseClassById(id),
    getActiveCourseOptions(),
  ]);

  if (!courseClass) {
    notFound();
  }

  const selectedCourse = courseClass.courseName
    ? [{ id: courseClass.course_id, name: courseClass.courseName }]
    : [];
  const courseOptions = [
    ...selectedCourse,
    ...courses.filter((course) => course.id !== courseClass.course_id),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MatriculasTabs />

      <Link
        href={`/matriculas/turmas/${courseClass.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para a turma
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar turma
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize curso, professor, periodo, horario e vagas.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <CourseClassForm
          mode="edit"
          courseClass={courseClass}
          courses={courseOptions}
        />
      </Card>
    </div>
  );
}
