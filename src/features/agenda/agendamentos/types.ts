import type { Database } from "@/types/database";

export type Appointment =
  Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentStatus = Appointment["status"];

export type AppointmentWithRelations = Appointment & {
  customerName: string | null;
  customerWhatsapp: string | null;
  customerPhone: string | null;
  professionalName: string | null;
  serviceName: string | null;
};

export type AppointmentOption = {
  id: string;
  label: string;
};

export type AppointmentServiceOption = AppointmentOption & {
  durationMinutes: number | null;
};

export type AppointmentOptions = {
  customers: AppointmentOption[];
  professionals: AppointmentOption[];
  services: AppointmentServiceOption[];
};

export type AppointmentFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialAppointmentFormState: AppointmentFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const appointmentStatuses: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluido",
  cancelled: "Cancelado",
};

export const appointmentStatusTones: Record<
  AppointmentStatus,
  "blue" | "violet" | "green" | "red"
> = {
  scheduled: "blue",
  confirmed: "violet",
  completed: "green",
  cancelled: "red",
};
