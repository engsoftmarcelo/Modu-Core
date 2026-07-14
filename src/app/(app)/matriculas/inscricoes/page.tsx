import type { Metadata } from "next";
import { BadgeCheck, Plus } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { EnrollmentList } from "@/features/matriculas/inscricoes/components/enrollment-list";
import { getEnrollments } from "@/features/matriculas/inscricoes/queries";

export const metadata: Metadata = { title: "Matriculas" };

export default async function EnrollmentsPage() {
  const { count, enrollments } = await getEnrollments();

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <PageHeader
        eyebrow="Jornada do aluno"
        icon={BadgeCheck}
        tone="green"
        title="Matriculas"
        description="Controle interessados, pagamentos e andamento dos alunos por turma."
        actions={[{ href: "/matriculas/inscricoes/novo", icon: Plus, label: "Nova matricula" }]}
      />

      <EnrollmentList count={count} enrollments={enrollments} />
    </div>
  );
}
