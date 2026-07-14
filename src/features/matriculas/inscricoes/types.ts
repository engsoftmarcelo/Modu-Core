import type { Database } from "@/types/database";

export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];

export type EnrollmentStatus = Enrollment["status"];

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
  "paid",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  interested: "Interessado",
  enrolled: "Matriculado",
  paid: "Pago",
  in_progress: "Em andamento",
  completed: "Concluido",
  cancelled: "Cancelado",
};
