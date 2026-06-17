import { z } from "zod";

import { SP_OFFSET } from "./calendar";

const optionalId = z
  .union([z.literal(""), z.uuid("Selecione uma opcao valida.")])
  .transform((value) => value || null);

export const appointmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(180, "Use no maximo 180 caracteres."),
  customerId: optionalId,
  professionalId: optionalId,
  serviceId: optionalId,
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida."),
  startTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Informe um horario valido."),
  durationMinutes: z.coerce
    .number({ message: "Informe a duracao em minutos." })
    .int("Use minutos inteiros.")
    .min(5, "A duracao deve ser de pelo menos 5 minutos.")
    .max(1440, "A duracao nao pode passar de 24 horas."),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"], {
    message: "Selecione um status valido.",
  }),
  location: z
    .string()
    .trim()
    .max(160, "Use no maximo 160 caracteres."),
  notes: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
});

export function parseAppointmentForm(formData: FormData) {
  return appointmentSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    customerId: String(formData.get("customerId") ?? ""),
    professionalId: String(formData.get("professionalId") ?? ""),
    serviceId: String(formData.get("serviceId") ?? ""),
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    durationMinutes: String(formData.get("durationMinutes") ?? ""),
    status: String(formData.get("status") ?? "scheduled"),
    location: String(formData.get("location") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

export type AppointmentInstants = {
  startsAt: string;
  endsAt: string;
};

// Combina data + horario locais (Sao Paulo) e a duracao em instantes ISO/UTC.
export function toAppointmentInstants(
  date: string,
  startTime: string,
  durationMinutes: number,
): AppointmentInstants {
  const startsAt = new Date(`${date}T${startTime}:00${SP_OFFSET}`);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

  return {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}

export function nullable(value: string) {
  return value || null;
}
