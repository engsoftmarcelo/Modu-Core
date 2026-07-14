import type { ComponentType } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  GraduationCap,
  Pencil,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import {
  EnrollmentPaymentStatusBadge,
  EnrollmentStatusBadge,
} from "@/features/matriculas/inscricoes/components/enrollment-status-badge";
import { getEnrollmentById } from "@/features/matriculas/inscricoes/queries";
import {
  enrollmentPaymentStatusLabels,
  enrollmentStatusLabels,
} from "@/features/matriculas/inscricoes/types";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { formatDateTime } from "@/lib/utils";

type EnrollmentDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; demo?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: EnrollmentDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const enrollment = await getEnrollmentById(id);

  return {
    title: enrollment?.studentName
      ? `Matricula de ${enrollment.studentName}`
      : "Matricula",
  };
}

export default async function EnrollmentDetailsPage({
  params,
  searchParams,
}: EnrollmentDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const enrollment = await getEnrollmentById(id);

  if (!enrollment) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MatriculasTabs />
      {notice.demo === "1" ? <CourseDemoProgress currentStep={3} /> : null}

      <Link
        href="/matriculas/inscricoes"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para matriculas
      </Link>

      {(notice.created === "1" || notice.updated === "1") && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Matricula criada com sucesso."
            : "Matricula atualizada com sucesso."}
        </div>
      )}

      {notice.demo === "1" ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">
              Etapa 3 concluida
            </p>
            <p className="mt-1 font-bold text-ink-950">
              O aluno ja aparece na chamada desta turma.
            </p>
          </div>
          <Link
            href={`/matriculas/frequencia?demo=1&classId=${enrollment.course_class_id}&enrollmentId=${enrollment.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <CalendarCheck2 className="size-4" />
            Registrar frequencia
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <BadgeCheck className="size-8" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
              {enrollment.studentName ?? "Matricula"}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <EnrollmentStatusBadge status={enrollment.status} />
              <EnrollmentPaymentStatusBadge
                status={enrollment.payment_status}
              />
            </div>
          </div>
        </div>

        <Link
          href={`/matriculas/inscricoes/${enrollment.id}/editar`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Pencil className="size-4" />
          Editar matricula
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-ink-950">Dados da matricula</h2>
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
            <InfoItem
              icon={UserRound}
              label="Aluno"
              value={enrollment.studentName ?? "Aluno nao informado"}
            />
            <InfoItem
              icon={GraduationCap}
              label="Turma"
              value={enrollment.courseName ?? "Turma nao informada"}
            />
            <InfoItem
              icon={UserRound}
              label="Professor"
              value={enrollment.teacher ?? "Professor nao informado"}
            />
            <InfoItem
              icon={BadgeCheck}
              label="Status"
              value={enrollmentStatusLabels[enrollment.status]}
            />
            <InfoItem
              icon={CircleDollarSign}
              label="Pagamento"
              value={enrollmentPaymentStatusLabels[enrollment.payment_status]}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-ink-950">Registro</h2>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <BadgeCheck className="mt-0.5 size-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Criada em
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-950">
                  {formatDateTime(enrollment.created_at)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 size-5 text-brand-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Ultima atualizacao
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-950">
                  {formatDateTime(enrollment.updated_at)}
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
  icon: ComponentType<{ className?: string }>;
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
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-950">
          {value}
        </p>
      </div>
    </div>
  );
}
