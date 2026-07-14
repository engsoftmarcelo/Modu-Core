import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Eye,
  GraduationCap,
  Pencil,
  Plus,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

import type { EnrollmentWithRelations } from "../types";
import {
  EnrollmentPaymentStatusBadge,
  EnrollmentStatusBadge,
} from "./enrollment-status-badge";

export function EnrollmentList({
  count,
  enrollments,
}: {
  count: number;
  enrollments: EnrollmentWithRelations[];
}) {
  if (!enrollments.length) {
    return (
      <EmptyState
        icon={BadgeCheck}
        tone="green"
        title="Nenhuma matricula criada ainda."
        description="Matricule um aluno em uma turma para acompanhar pagamento, andamento e conclusao do curso."
        primaryAction={{
          href: "/matriculas/inscricoes/novo",
          icon: Plus,
          label: "Criar primeira matricula",
        }}
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "matricula" : "matriculas"}
        </p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <th className="px-6 py-4">Aluno</th>
              <th className="px-5 py-4">Turma</th>
              <th className="px-5 py-4">Professor</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Pagamento</th>
              <th className="px-5 py-4">Criada em</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr
                key={enrollment.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-emerald-50/50"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/matriculas/inscricoes/${enrollment.id}`}
                    className="font-bold text-ink-950 hover:text-emerald-700"
                  >
                    {enrollment.studentName ?? "Aluno nao informado"}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {enrollment.courseName ?? "Turma nao informada"}
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">
                  {enrollment.teacher ?? "-"}
                </td>
                <td className="px-5 py-4">
                  <EnrollmentStatusBadge status={enrollment.status} />
                </td>
                <td className="px-5 py-4">
                  <EnrollmentPaymentStatusBadge
                    status={enrollment.payment_status}
                  />
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {formatDate(enrollment.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/matriculas/inscricoes/${enrollment.id}`}
                      aria-label="Ver matricula"
                      className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-emerald-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/matriculas/inscricoes/${enrollment.id}/editar`}
                      aria-label="Editar matricula"
                      className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-emerald-700"
                    >
                      <Pencil className="size-[18px]" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {enrollments.map((enrollment) => (
          <Link
            key={enrollment.id}
            href={`/matriculas/inscricoes/${enrollment.id}`}
            className="flex gap-3 p-5 transition hover:bg-emerald-50/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <BadgeCheck className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-bold text-ink-950">
                  {enrollment.studentName ?? "Aluno nao informado"}
                </p>
                <EnrollmentStatusBadge status={enrollment.status} />
                <EnrollmentPaymentStatusBadge
                  status={enrollment.payment_status}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-3.5" />
                  {enrollment.courseName ?? "Turma"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" />
                  {enrollment.teacher ?? "Professor"}
                </span>
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
