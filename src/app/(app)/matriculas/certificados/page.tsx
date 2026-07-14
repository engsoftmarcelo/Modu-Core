import type { Metadata } from "next";
import Link from "next/link";
import { Award, CheckCircle2, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CertificatePreview } from "@/features/matriculas/certificados/components/certificate-preview";
import { PrintButton } from "@/features/matriculas/certificados/components/print-button";
import { getCertificateData } from "@/features/matriculas/certificados/queries";
import { CourseDemoProgress } from "@/features/matriculas/demo/course-demo-progress";
import { MatriculasTabs } from "@/features/matriculas/matriculas-tabs";

export const metadata: Metadata = { title: "Certificados" };

type CertificatesPageProps = {
  searchParams: Promise<{
    date?: string;
    demo?: string;
    enrollmentId?: string;
  }>;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CertificatesPage({
  searchParams,
}: CertificatesPageProps) {
  const params = await searchParams;
  const certificateDate = params.date || todayIsoDate();
  const demoMode = params.demo === "1";
  const { certificate, options } = await getCertificateData({
    certificateDate,
    enrollmentId: params.enrollmentId,
  });

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="space-y-6 print:hidden">
        <MatriculasTabs />
        {demoMode ? <CourseDemoProgress currentStep={5} /> : null}
      </div>

      <div className="flex flex-col gap-5 print:hidden sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="violet">
            <Award className="mr-1.5 size-3.5" />
            Certificados
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Certificado simples
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Gere uma tela imprimivel com aluno, curso, carga horaria, data e
            escola.
          </p>
        </div>

        {certificate ? <PrintButton /> : null}
      </div>

      <Card className="p-5 print:hidden sm:p-6">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          {demoMode ? <input type="hidden" name="demo" value="1" /> : null}

          <div className="space-y-2">
            <label
              htmlFor="enrollmentId"
              className="text-sm font-semibold text-slate-700"
            >
              Matricula
            </label>
            <select
              id="enrollmentId"
              name="enrollmentId"
              defaultValue={params.enrollmentId ?? ""}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              required
            >
              <option value="">Selecione uma matricula</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-semibold text-slate-700">
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={certificateDate}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
          >
            Gerar certificado
          </button>
        </form>
      </Card>

      {demoMode && certificate ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">
                Demo concluida
              </p>
              <p className="mt-1 font-bold text-ink-950">
                Curso, turma, matricula, frequencia e certificado apresentados.
              </p>
            </div>
          </div>
          <Link
            href="/matriculas/demo"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
          >
            <RotateCcw className="size-4" />
            Nova demonstracao
          </Link>
        </div>
      ) : null}

      {certificate ? (
        <div className="print:fixed print:inset-0 print:z-50 print:bg-white">
          <CertificatePreview certificate={certificate} />
        </div>
      ) : (
        <Card className="grid min-h-80 place-items-center px-6 py-12 text-center print:hidden">
          <div className="max-w-md">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <Award className="size-7" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-ink-950">
              Selecione uma matricula
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A previa do certificado aparece depois que voce escolher a
              matricula do aluno.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
