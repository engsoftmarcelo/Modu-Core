import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Pencil,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import {
  formatTime,
  formatWeekdays,
} from "@/features/matriculas/turmas/components/course-class-list";
import { getCourseClassById } from "@/features/matriculas/turmas/queries";
import { formatDate, formatDateTime } from "@/lib/utils";

type CourseClassDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; demo?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: CourseClassDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const courseClass = await getCourseClassById(id);

  return {
    title: courseClass?.courseName
      ? `Turma de ${courseClass.courseName}`
      : "Turma",
  };
}

export default async function CourseClassDetailsPage({
  params,
  searchParams,
}: CourseClassDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const courseClass = await getCourseClassById(id);

  if (!courseClass) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MatriculasTabs />
      {notice.demo === "1" ? <CourseDemoProgress currentStep={2} /> : null}

      <Link
        href="/matriculas/turmas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para turmas
      </Link>

      {(notice.created === "1" || notice.updated === "1") && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Turma criada com sucesso."
            : "Turma atualizada com sucesso."}
        </div>
      )}

      {notice.demo === "1" ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-violet-600">
              Etapa 2 concluida
            </p>
            <p className="mt-1 font-bold text-ink-950">
              A turma esta pronta para receber alunos.
            </p>
          </div>
          <Link
            href={`/matriculas/inscricoes/novo?demo=1&classId=${courseClass.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Matricular aluno
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <CalendarDays className="size-8" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold text-ink-950 sm:text-4xl">
              {courseClass.courseName ?? "Turma"}
            </h1>
            <p className="mt-2 text-slate-500">Professor: {courseClass.teacher}</p>
          </div>
        </div>

        <Link
          href={`/matriculas/turmas/${courseClass.id}/editar`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Pencil className="size-4" />
          Editar turma
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-ink-950">Dados da turma</h2>
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
            <InfoItem icon={UserRound} label="Professor" value={courseClass.teacher} />
            <InfoItem
              icon={CalendarDays}
              label="Periodo"
              value={`${formatDate(courseClass.start_date)} ate ${formatDate(
                courseClass.end_date,
              )}`}
            />
            <InfoItem
              icon={Clock3}
              label="Dias e horario"
              value={`${formatWeekdays(courseClass.weekdays)} - ${formatTime(
                courseClass.class_time,
              )}`}
            />
            <InfoItem
              icon={UsersRound}
              label="Vagas"
              value={`${courseClass.capacity} vagas`}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-ink-950">Registro</h2>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-5 text-violet-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Criado em
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-950">
                  {formatDateTime(courseClass.created_at)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 size-5 text-brand-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Ultima atualizacao
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-950">
                  {formatDateTime(courseClass.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type InfoItemProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3 bg-white p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-950">
          {value}
        </p>
      </div>
    </div>
  );
}
