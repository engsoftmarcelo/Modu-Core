import type { Database } from "@/types/database";

export type Student = Database["public"]["Tables"]["students"]["Row"];

export type StudentStatus = Student["status"];

export type StudentFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialStudentFormState: StudentFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};
