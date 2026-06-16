import type { Database } from "@/types/database";

export type Service = Database["public"]["Tables"]["services"]["Row"];

export type ServiceFilter = "all" | "active" | "inactive";

export type ServiceFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialServiceFormState: ServiceFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const serviceStatusLabels: Record<"active" | "inactive", string> = {
  active: "Ativo",
  inactive: "Inativo",
};
