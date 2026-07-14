import type { Database } from "@/types/database";

export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];

export type EnrollmentStatus = Enrollment["status"];
export type EnrollmentPaymentStatus = Enrollment["payment_status"];

export type EnrollmentWithRelations = Enrollment & {
  className: string | null;
  courseName: string | null;
  studentName: string | null;
  teacher: string | null;
};

export type EnrollmentFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialEnrollmentFormState: EnrollmentFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const enrollmentStatuses = [
  "interested",
  "enrolled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  interested: "Interessado",
  enrolled: "Matriculado",
  in_progress: "Em andamento",
  completed: "Concluido",
  cancelled: "Cancelado",
};

export const enrollmentPaymentStatuses = [
  "pending",
  "paid",
  "refunded",
  "waived",
] as const;

export const enrollmentPaymentStatusLabels: Record<
  EnrollmentPaymentStatus,
  string
> = {
  pending: "Pendente",
  paid: "Pago",
  refunded: "Reembolsado",
  waived: "Isento",
};
