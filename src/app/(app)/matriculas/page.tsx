import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, GraduationCap, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StudentList } from "@/features/matriculas/alunos/components/student-list";
import { StudentSearch } from "@/features/matriculas/alunos/components/student-search";
import { getStudents } from "@/features/matriculas/alunos/queries";
import type { StudentStatus } from "@/features/matriculas/alunos/types";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = { title: "Matriculas" };

type MatriculasPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function MatriculasPage({
  searchParams,
}: MatriculasPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const status: StudentStatus | "all" =
    params.status === "active" || params.status === "inactive"
      ? params.status
      : "all";
  const { count, students } = await getStudents({ query, status });

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <GraduationCap className="mr-1.5 size-3.5" />
            Matriculas
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Alunos
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Cadastre contatos de alunos para demonstrar matriculas, turmas,
            frequencia e certificados nas proximas etapas.
          </p>
        </div>

        <Link
          href="/matriculas/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Novo aluno
        </Link>
      </div>

      {params.deleted === "1" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Aluno excluido com sucesso.
        </div>
      )}

      <StudentSearch query={query} status={status} />
      <StudentList
        students={students}
        count={count}
        hasFilters={Boolean(query) || status !== "all"}
      />
    </div>
  );
}
