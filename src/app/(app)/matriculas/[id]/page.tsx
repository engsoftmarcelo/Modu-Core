import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { StudentStatusBadge } from "@/features/matriculas/alunos/components/student-status-badge";
import { studentWhatsAppHref } from "@/features/matriculas/alunos/components/student-list";
import { getStudentById } from "@/features/matriculas/alunos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { formatDateTime, getInitials } from "@/lib/utils";

type StudentDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: StudentDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentById(id);

  return {
    title: student?.name ?? "Aluno",
  };
}

export default async function StudentDetailsPage({
  params,
  searchParams,
}: StudentDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MatriculasTabs />

      <Link
        href="/matriculas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para alunos
      </Link>

      {(notice.created === "1" || notice.updated === "1") && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Aluno criado com sucesso."
            : "Aluno atualizado com sucesso."}
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-50 text-xl font-bold text-violet-700">
            {getInitials(student.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold text-ink-950 sm:text-4xl">
                {student.name}
              </h1>
              <StudentStatusBadge status={student.status} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-slate-500">
              <UserRound className="size-4" />
              Cadastro de aluno
            </p>
          </div>
        </div>

        <Link
          href={`/matriculas/${student.id}/editar`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Pencil className="size-4" />
          Editar aluno
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Contato</h2>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <ContactItem
                icon={MessageCircle}
                label="WhatsApp"
                value={student.whatsapp}
                href={
                  student.whatsapp
                    ? studentWhatsAppHref(student.whatsapp)
                    : undefined
                }
                external
              />
              <ContactItem
                icon={Mail}
                label="E-mail"
                value={student.email}
                href={student.email ? `mailto:${student.email}` : undefined}
              />
              <ContactItem icon={ShieldCheck} label="CPF" value={student.cpf} />
              <ContactItem
                icon={FileText}
                label="Observacoes"
                value={student.notes}
              />
            </div>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-ink-950">Registro</h2>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <UserRound className="mt-0.5 size-5 text-violet-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Criado em
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-950">
                  {formatDateTime(student.created_at)}
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
                  {formatDateTime(student.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type ContactItemProps = {
  external?: boolean;
  href?: string;
  icon: typeof MessageCircle;
  label: string;
  value: string | null;
};

function ContactItem({
  external,
  href,
  icon: Icon,
  label,
  value,
}: ContactItemProps) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-950">
          {value || "Nao informado"}
        </p>
      </div>
    </>
  );

  if (href && value) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="flex items-center gap-3 bg-white p-5 transition hover:bg-violet-50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3 bg-white p-5">{content}</div>;
}
