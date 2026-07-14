import Link from "next/link";
import {
  ChevronRight,
  Eye,
  Mail,
  MessageCircle,
  Pencil,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

import type { Student } from "../types";
import { StudentStatusBadge } from "./student-status-badge";

export function studentWhatsAppHref(value: string) {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function StudentList({
  count,
  students,
}: {
  count: number;
  students: Student[];
}) {
  if (!students.length) {
    return (
      <Card className="grid min-h-80 place-items-center px-6 py-12 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-700">
            <UserRound className="size-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-ink-950">
            Nenhum aluno encontrado
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Cadastre o primeiro aluno para demonstrar o fluxo de matriculas.
          </p>
          <Link
            href="/matriculas/novo"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Cadastrar aluno
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "aluno" : "alunos"}
        </p>
        {count > 100 && (
          <p className="mt-1 text-xs text-slate-500">
            Exibindo os primeiros 100 resultados.
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Aluno</th>
              <th className="px-5 py-4">Contato</th>
              <th className="px-5 py-4">CPF</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-violet-50/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700">
                      {getInitials(student.name)}
                    </span>
                    <Link
                      href={`/matriculas/${student.id}`}
                      className="font-bold text-ink-950 hover:text-violet-700"
                    >
                      {student.name}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    {student.whatsapp && (
                      <p className="flex items-center gap-2">
                        <MessageCircle className="size-3.5 text-slate-400" />
                        {student.whatsapp}
                      </p>
                    )}
                    {student.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="size-3.5 text-slate-400" />
                        {student.email}
                      </p>
                    )}
                    {!student.whatsapp && !student.email && (
                      <span className="text-slate-400">Sem contato</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  {student.cpf || "Nao informado"}
                </td>
                <td className="px-5 py-4">
                  <StudentStatusBadge status={student.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/matriculas/${student.id}`}
                      aria-label={`Ver ${student.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/matriculas/${student.id}/editar`}
                      aria-label={`Editar ${student.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-violet-700"
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
        {students.map((student) => (
          <Link
            key={student.id}
            href={`/matriculas/${student.id}`}
            className="flex gap-3 p-5 transition hover:bg-violet-50/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700">
              {getInitials(student.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-bold text-ink-950">{student.name}</p>
                <StudentStatusBadge status={student.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                {student.whatsapp && (
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" />
                    {student.whatsapp}
                  </span>
                )}
                {student.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {student.email}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
