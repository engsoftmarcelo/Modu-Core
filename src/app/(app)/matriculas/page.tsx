import type { Metadata } from "next";
import { GraduationCap, Plus } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
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

      <PageHeader
        eyebrow="Matriculas"
        icon={GraduationCap}
        tone="violet"
        title="Alunos"
        description="Cadastre alunos e acompanhe matriculas, turmas, frequencia e certificados."
        actions={[{ href: "/matriculas/novo", icon: Plus, label: "Novo aluno" }]}
      />

      {params.deleted === "1" && (
        <Notice tone="success">Aluno excluido com sucesso.</Notice>
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
