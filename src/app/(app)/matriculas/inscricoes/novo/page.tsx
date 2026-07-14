import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpenCheck,
  ChevronLeft,
  UserPlus,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import { EnrollmentForm } from "@/features/matriculas/inscricoes/components/enrollment-form";
import { getStudentOptions } from "@/features/matriculas/alunos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { getCourseClassOptions } from "@/features/matriculas/turmas/queries";

export const metadata: Metadata = { title: "Nova matricula" };

type NewEnrollmentPageProps = {
  searchParams: Promise<{
    classId?: string;
    demo?: string;
    studentId?: string;
  }>;
};

export default async function NewEnrollmentPage({
  searchParams,
}: NewEnrollmentPageProps) {
  const [params, students, classes] = await Promise.all([
    searchParams,
    getStudentOptions(),
    getCourseClassOptions(),
  ]);
  const demoMode = params.demo === "1";
  const defaultClassId = classes.some(
    (courseClass) => courseClass.id === params.classId,
  )
    ? params.classId
    : undefined;
  const requestedStudentId = students.some(
    (student) => student.id === params.studentId,
  )
    ? params.studentId
    : undefined;
  const defaultStudentId = requestedStudentId ??
    (demoMode ? students[0]?.id : undefined);
  const backHref = demoMode
    ? defaultClassId
      ? `/matriculas/turmas/${defaultClassId}?demo=1`
      : "/matriculas/demo"
    : "/matriculas/inscricoes";
  const demoBlocker = demoMode && (!classes.length || !students.length);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <MatriculasTabs />
      {demoMode ? <CourseDemoProgress currentStep={3} /> : null}

      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        {demoMode ? "Voltar para a turma" : "Voltar para matriculas"}
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <BadgeCheck className="size-7" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Nova matricula
          </h1>
          <p className="mt-2 text-slate-500">
            Vincule um aluno a uma turma e acompanhe o status.
          </p>
        </div>
      </div>

      {demoBlocker ? (
        <Card className="p-6 text-center sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            {students.length ? (
              <BookOpenCheck className="size-6" />
            ) : (
              <UserPlus className="size-6" />
            )}
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink-950">
            {students.length ? "Crie uma turma" : "Prepare um aluno"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {students.length
              ? "A demo precisa de uma turma disponivel para registrar a matricula."
              : "A demo precisa de um aluno ativo para seguir ate a frequencia e o certificado."}
          </p>
          <Link
            href={
              students.length
                ? "/matriculas/turmas/novo?demo=1"
                : `/matriculas/novo?demo=1${
                    defaultClassId ? `&classId=${defaultClassId}` : ""
                  }`
            }
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            {students.length ? "Criar turma" : "Cadastrar aluno"}
          </Link>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6">
          <EnrollmentForm
            classes={classes}
            defaultClassId={defaultClassId}
            defaultStudentId={defaultStudentId}
            demoMode={demoMode}
            mode="create"
            students={students}
          />
        </Card>
      )}
    </div>
  );
}
