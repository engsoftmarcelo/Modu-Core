import type { Database } from "@/types/database";

export type Course = Database["public"]["Tables"]["courses"]["Row"];

export type CourseModality = Course["modality"];

export type CourseFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialCourseFormState: CourseFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const courseModalityLabels: Record<CourseModality, string> = {
  presencial: "Presencial",
  online: "Online",
  hibrido: "Hibrido",
};
