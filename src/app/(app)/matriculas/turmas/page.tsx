import type { Metadata } from "next";
import { CalendarDays, Plus } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { CourseClassList } from "@/features/matriculas/turmas/components/course-class-list";
import { getCourseClasses } from "@/features/matriculas/turmas/queries";

export const metadata: Metadata = { title: "Turmas" };

export default async function CourseClassesPage() {
  const { classes, count } = await getCourseClasses();

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <PageHeader
        eyebrow="Oferta de turmas"
        icon={CalendarDays}
        tone="violet"
        title="Turmas"
        description="Organize curso, professor, periodo, dias, horario e vagas."
        actions={[{ href: "/matriculas/turmas/novo", icon: Plus, label: "Nova turma" }]}
      />

      <CourseClassList classes={classes} count={count} />
    </div>
  );
}
