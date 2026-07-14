import type { Metadata } from "next";
import { BookOpenCheck, Plus } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { CourseList } from "@/features/matriculas/cursos/components/course-list";
import { CourseSearch } from "@/features/matriculas/cursos/components/course-search";
import { getCourses } from "@/features/matriculas/cursos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = { title: "Cursos" };

type CoursesPageProps = {
  searchParams: Promise<{
    active?: string;
    deleted?: string;
    q?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const active: "active" | "inactive" | "all" =
    params.active === "active" || params.active === "inactive"
      ? params.active
      : "all";
  const { count, courses } = await getCourses({ active, query });

  return (
    <div className="space-y-6">
      <MatriculasTabs />

      <PageHeader
        eyebrow="Catalogo academico"
        icon={BookOpenCheck}
        tone="violet"
        title="Cursos"
        description="Cadastre modalidade, carga horaria e preco para montar turmas e matriculas."
        actions={[{ href: "/matriculas/cursos/novo", icon: Plus, label: "Novo curso" }]}
      />

      {params.deleted === "1" && (
        <Notice tone="success">Curso excluido com sucesso.</Notice>
      )}

      <CourseSearch query={query} active={active} />
      <CourseList
        courses={courses}
        count={count}
        hasFilters={Boolean(query) || active !== "all"}
      />
    </div>
  );
}
