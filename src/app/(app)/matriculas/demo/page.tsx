import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  PlayCircle,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getStudentOptions } from "@/features/matriculas/alunos/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = { title: "Demo de cursos" };

const demoSteps = [
  {
    description: "Oferta, carga horaria, modalidade e preco.",
    icon: BookOpenCheck,
    label: "Criar curso",
  },
  {
    description: "Professor, periodo, dias, horario e vagas.",
    icon: CalendarDays,
    label: "Criar turma",
  },
  {
    description: "Aluno, turma e status Matriculado.",
    icon: BadgeCheck,
    label: "Matricular aluno",
  },
  {
    description: "Data da aula e presenca do aluno.",
    icon: CalendarCheck2,
    label: "Registrar frequencia",
  },
  {
    description: "Nome, curso, carga horaria, escola e data.",
    icon: Award,
    label: "Emitir certificado visual",
  },
] as const;

type CourseDemoPageProps = {
  searchParams: Promise<{ ready?: string }>;
};

export default async function CourseDemoPage({
  searchParams,
}: CourseDemoPageProps) {
  const [params, students] = await Promise.all([
    searchParams,
    getStudentOptions(),
  ]);
  const demoStudent = students[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MatriculasTabs />

      {params.ready === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Aluno preparado. A demo ja pode comecar.
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <PlayCircle className="mr-1.5 size-3.5" />
            Demo guiada
          </Badge>
          <h1 className="mt-4 text-3xl font-bold text-ink-950 sm:text-4xl">
            Demo de cursos em 5 etapas
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Apresente o ciclo completo de uma turma, do cadastro ao certificado.
          </p>
        </div>

        <Link
          href={
            demoStudent
              ? "/matriculas/cursos/novo?demo=1"
              : "/matriculas/novo?demo=1"
          }
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-ink-950 px-6 text-base font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          {demoStudent ? (
            <PlayCircle className="size-5" />
          ) : (
            <UserPlus className="size-5" />
          )}
          {demoStudent ? "Iniciar demo" : "Preparar aluno"}
          <ArrowRight className="size-5" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-ink-950">Fluxo da demonstracao</h2>
          </div>
          <ol className="divide-y divide-slate-100">
            {demoSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <li
                  key={step.label}
                  className="flex items-center gap-4 px-5 py-4 sm:px-6"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Etapa {index + 1}
                    </p>
                    <p className="mt-1 font-bold text-ink-950">{step.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="h-fit p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                demoStudent
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {demoStudent ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <UserPlus className="size-5" />
              )}
            </span>
            <div>
              <h2 className="font-bold text-ink-950">
                {demoStudent ? "Aluno pronto" : "Preparacao necessaria"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {demoStudent
                  ? `${demoStudent.name} sera pre-selecionado na matricula.`
                  : "Cadastre um aluno antes de iniciar o fluxo das cinco etapas."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
