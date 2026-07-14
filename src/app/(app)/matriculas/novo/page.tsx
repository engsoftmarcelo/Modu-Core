import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StudentForm } from "@/features/matriculas/alunos/components/student-form";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = {
  title: "Novo aluno",
};

type NewStudentPageProps = {
  searchParams: Promise<{ classId?: string; demo?: string }>;
};

export default async function NewStudentPage({
  searchParams,
}: NewStudentPageProps) {
  const params = await searchParams;
  const demoMode = params.demo === "1";
  const backHref = demoMode
    ? params.classId
      ? `/matriculas/inscricoes/novo?demo=1&classId=${encodeURIComponent(params.classId)}`
      : "/matriculas/demo"
    : "/matriculas";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MatriculasTabs />

      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        {demoMode ? "Voltar para a demo" : "Voltar para alunos"}
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <UserPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            {demoMode ? "Aluno da demo" : "Novo aluno"}
          </h1>
          <p className="mt-1 text-slate-500">
            {demoMode
              ? "Revise os dados sugeridos para preparar a demonstracao."
              : "Preencha o essencial para iniciar uma matricula demonstravel."}
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <StudentForm
          demoClassId={params.classId}
          demoMode={demoMode}
          mode="create"
        />
      </Card>
    </div>
  );
}
