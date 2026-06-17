import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { AppointmentForm } from "@/features/agenda/agendamentos/components/appointment-form";
import { isValidDateKey, todayDateKey } from "@/features/agenda/agendamentos/calendar";
import { getAppointmentOptions } from "@/features/agenda/agendamentos/queries";

export const metadata: Metadata = { title: "Novo agendamento" };

type NewAppointmentPageProps = {
  searchParams: Promise<{
    date?: string;
    time?: string;
    customerId?: string;
    professionalId?: string;
    serviceId?: string;
  }>;
};

export default async function NewAppointmentPage({
  searchParams,
}: NewAppointmentPageProps) {
  const [params, options] = await Promise.all([
    searchParams,
    getAppointmentOptions(),
  ]);

  const date =
    params.date && isValidDateKey(params.date) ? params.date : todayDateKey();
  const startTime = /^\d{2}:\d{2}$/.test(params.time ?? "")
    ? (params.time as string)
    : "09:00";
  const service = options.services.find(
    (option) => option.id === params.serviceId,
  );
  const customer = options.customers.find(
    (option) => option.id === params.customerId,
  );
  const professional = options.professionals.find(
    (option) => option.id === params.professionalId,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/agenda"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para a agenda
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <CalendarPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Novo agendamento
          </h1>
          <p className="mt-1 text-slate-500">
            Defina o horario, o cliente e o profissional do atendimento.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <AppointmentForm
          mode="create"
          options={options}
          defaults={{
            date,
            startTime,
            durationMinutes: service?.durationMinutes ?? 30,
            customerId: customer?.id ?? "",
            professionalId: professional?.id ?? "",
            serviceId: service?.id ?? "",
            title: service ? service.label.replace(/\s*\(.*\)$/, "") : "",
          }}
        />
      </Card>
    </div>
  );
}
