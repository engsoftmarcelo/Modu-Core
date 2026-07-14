import { Award, CalendarDays, Clock3, GraduationCap } from "lucide-react";

import { formatDate } from "@/lib/utils";

import type { CertificateData } from "../queries";

export function CertificatePreview({
  certificate,
}: {
  certificate: CertificateData;
}) {
  return (
    <section className="mx-auto max-w-5xl bg-white print:max-w-none">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 print:rounded-none print:border-0 print:p-10 print:shadow-none sm:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-violet-600 print:bg-ink-950" />

        <div className="flex flex-col gap-8 border-4 border-double border-slate-200 px-6 py-10 text-center sm:px-10 sm:py-14">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700 print:bg-white print:text-ink-950">
              <Award className="size-8" />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
              Certificado de conclusao
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-5xl">
              {certificate.studentName}
            </h2>
          </div>

          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
            Certificamos que concluiu o curso{" "}
            <strong className="font-bold text-ink-950">
              {certificate.courseName}
            </strong>
            , com carga horaria de{" "}
            <strong className="font-bold text-ink-950">
              {certificate.workloadHours} horas
            </strong>
            .
          </p>

          <div className="mx-auto grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
            <InfoItem
              icon={GraduationCap}
              label="Curso"
              value={certificate.courseName}
            />
            <InfoItem
              icon={Clock3}
              label="Carga horaria"
              value={`${certificate.workloadHours} horas`}
            />
            <InfoItem
              icon={CalendarDays}
              label="Data"
              value={formatDate(certificate.date)}
            />
          </div>

          <div className="mx-auto mt-6 w-full max-w-sm border-t border-slate-300 pt-4">
            <p className="font-bold text-ink-950">{certificate.schoolName}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Nome da escola
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type InfoItemProps = {
  icon: typeof GraduationCap;
  label: string;
  value: string;
};

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 print:bg-white">
      <Icon className="size-5 text-brand-600 print:text-ink-950" />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-ink-950">{value}</p>
    </div>
  );
}
