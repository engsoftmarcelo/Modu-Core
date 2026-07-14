import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StudentForm } from "@/features/matriculas/alunos/components/student-form";
import { getStudentById } from "@/features/matriculas/alunos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditStudentPageProps): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentById(id);

  return {
    title: student ? `Editar ${student.name}` : "Editar aluno",
  };
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <MatriculasTabs />

      <Link
        href={`/matriculas/${student.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o aluno
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar aluno
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize os dados de {student.name}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <StudentForm mode="edit" student={student} />
      </Card>
    </div>
  );
}
