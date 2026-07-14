import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getStudentOptions } from "@/features/matriculas/alunos/queries";
import { EnrollmentForm } from "@/features/matriculas/inscricoes/components/enrollment-form";
import { getEnrollmentById } from "@/features/matriculas/inscricoes/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { getCourseClassOptions } from "@/features/matriculas/turmas/queries";

type EditEnrollmentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditEnrollmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const enrollment = await getEnrollmentById(id);

  return {
    title: enrollment?.studentName
      ? `Editar matricula de ${enrollment.studentName}`
      : "Editar matricula",
  };
}

export default async function EditEnrollmentPage({
  params,
}: EditEnrollmentPageProps) {
  const { id } = await params;
  const [enrollment, students, classes] = await Promise.all([
    getEnrollmentById(id),
    getStudentOptions(),
    getCourseClassOptions(),
  ]);

  if (!enrollment) {
    notFound();
  }

  const studentOptions = students.some((student) => student.id === enrollment.student_id)
    ? students
    : [
        {
          id: enrollment.student_id,
          name: enrollment.studentName ?? "Aluno atual",
        },
        ...students,
      ];
  const classOptions = classes.some(
    (courseClass) => courseClass.id === enrollment.course_class_id,
  )
    ? classes
    : [
        {
          id: enrollment.course_class_id,
          label: enrollment.courseName ?? "Turma atual",
        },
        ...classes,
      ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <MatriculasTabs />

      <Link
        href={`/matriculas/inscricoes/${enrollment.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para matricula
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <BadgeCheck className="size-7" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Editar matricula
          </h1>
          <p className="mt-2 text-slate-500">
            Atualize turma, aluno ou status da matricula.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <EnrollmentForm
          classes={classOptions}
          enrollment={enrollment}
          mode="edit"
          students={studentOptions}
        />
      </Card>
    </div>
  );
}
