import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { AppointmentForm } from "@/features/agenda/agendamentos/components/appointment-form";
import { spDateKey, spTime } from "@/features/agenda/agendamentos/calendar";
import {
  getAppointmentById,
  getAppointmentOptions,
} from "@/features/agenda/agendamentos/queries";

type EditAppointmentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditAppointmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  return {
    title: appointment ? `Editar ${appointment.title}` : "Editar agendamento",
  };
}

export default async function EditAppointmentPage({
  params,
}: EditAppointmentPageProps) {
  const { id } = await params;
  const [appointment, options] = await Promise.all([
    getAppointmentById(id),
    getAppointmentOptions(),
  ]);

  if (!appointment) {
    notFound();
  }

  const durationMinutes = Math.round(
    (new Date(appointment.ends_at).getTime() -
      new Date(appointment.starts_at).getTime()) /
      60_000,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/agenda/agendamentos/${appointment.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o agendamento
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar agendamento
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize o horario, os vinculos e o status de {appointment.title}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <AppointmentForm
          mode="edit"
          appointment={appointment}
          options={options}
          defaults={{
            date: spDateKey(appointment.starts_at),
            startTime: spTime(appointment.starts_at),
            durationMinutes: durationMinutes > 0 ? durationMinutes : 30,
            customerId: appointment.customer_id ?? "",
            professionalId: appointment.professional_id ?? "",
            serviceId: appointment.service_id ?? "",
            title: appointment.title,
          }}
        />
      </Card>
    </div>
  );
}
