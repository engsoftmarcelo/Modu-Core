import type { Database } from "@/types/database";

export type Professional =
  Database["public"]["Tables"]["professionals"]["Row"];

export type ProfessionalFilter = "all" | "active" | "inactive";

export type ProfessionalServiceRef = {
  id: string;
  name: string;
};

export type ProfessionalWithServices = Professional & {
  services: ProfessionalServiceRef[];
};

export type ServiceOption = {
  id: string;
  name: string;
  active: boolean;
};

export type ProfessionalFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialProfessionalFormState: ProfessionalFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const professionalStatusLabels: Record<"active" | "inactive", string> = {
  active: "Ativo",
  inactive: "Inativo",
};
