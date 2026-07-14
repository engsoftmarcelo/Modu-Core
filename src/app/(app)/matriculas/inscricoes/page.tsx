import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { EnrollmentList } from "@/features/matriculas/inscricoes/components/enrollment-list";
import { getEnrollments } from "@/features/matriculas/inscricoes/queries";

export const metadata: Metadata = { title: "Matriculas" };

export default async function EnrollmentsPage() {
  const { count, enrollments } = await getEnrollments();

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">
            <BadgeCheck className="mr-1.5 size-3.5" />
            Matriculas
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Matriculas
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Controle interessados, matriculados, pagamentos e andamento dos
            alunos por turma.
          </p>
        </div>

        <Link
          href="/matriculas/inscricoes/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Nova matricula
        </Link>
      </div>

      <EnrollmentList count={count} enrollments={enrollments} />
    </div>
  );
}
