import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarCheck2,
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import { AttendanceForm } from "@/features/matriculas/frequencia/components/attendance-form";
import { getAttendanceData } from "@/features/matriculas/frequencia/queries";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Frequencia" };

type AttendancePageProps = {
  searchParams: Promise<{
    classId?: string;
    date?: string;
    demo?: string;
    enrollmentId?: string;
    saved?: string;
  }>;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const params = await searchParams;
  const classDate = params.date || todayIsoDate();
  const selectedClassId = params.classId;
  const demoMode = params.demo === "1";
  const { classes, students } = await getAttendanceData({
    classDate,
    courseClassId: selectedClassId,
  });
  const requestedDemoEnrollment = students.find(
    (student) => student.enrollmentId === params.enrollmentId,
  );
  const demoEnrollmentId = demoMode
    ? requestedDemoEnrollment?.enrollmentId ??
      (students.length === 1 ? students[0].enrollmentId : undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <MatriculasTabs />
      {demoMode ? <CourseDemoProgress currentStep={4} /> : null}

      <div>
        <Badge tone="blue">
          <CalendarCheck2 className="mr-1.5 size-3.5" />
          Frequencia
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
          Frequencia simples
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
          Escolha a turma, informe a data da aula e marque quem esteve presente.
        </p>
      </div>

      {params.saved === "1" ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="size-5 shrink-0" />
            {demoMode ? "Etapa 4 concluida." : "Frequencia salva com sucesso."}
          </div>
          {demoMode && demoEnrollmentId ? (
            <Link
              href={`/matriculas/certificados?demo=1&enrollmentId=${demoEnrollmentId}&date=${classDate}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <Award className="size-4" />
              Emitir certificado
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      ) : null}

      <Card className="p-5 sm:p-6">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          {demoMode ? <input type="hidden" name="demo" value="1" /> : null}
          {demoEnrollmentId ? (
            <input type="hidden" name="enrollmentId" value={demoEnrollmentId} />
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="classId"
              className="text-sm font-semibold text-slate-700"
            >
              Turma
            </label>
            <select
              id="classId"
              name="classId"
              defaultValue={selectedClassId ?? ""}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              required
            >
              <option value="">Selecione uma turma</option>
              {classes.map((courseClass) => (
                <option key={courseClass.id} value={courseClass.id}>
                  {courseClass.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-semibold text-slate-700">
              Data da aula
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={classDate}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
          >
            Carregar alunos
          </button>
        </form>
      </Card>

      <Card className={cn("p-5 sm:p-6", !selectedClassId && "text-center")}>
        {!selectedClassId ? (
          <div className="mx-auto max-w-md py-10">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <CalendarCheck2 className="size-7" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-ink-950">
              Selecione uma turma
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A lista de alunos aparece depois que voce escolhe a turma e a data
              da aula.
            </p>
          </div>
        ) : students.length ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-ink-950">Lista de alunos</h2>
              <p className="mt-1 text-sm text-slate-500">
                {students.length} {students.length === 1 ? "aluno" : "alunos"}{" "}
                para chamada nesta aula.
              </p>
            </div>
            <AttendanceForm
              classDate={classDate}
              courseClassId={selectedClassId}
              demoEnrollmentId={demoEnrollmentId}
              demoMode={demoMode}
              students={students}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-md py-10 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <CalendarCheck2 className="size-7" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-ink-950">
              Nenhum aluno para chamada
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Esta turma ainda nao tem alunos com status Matriculado, Pago, Em
              andamento ou Concluido.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
