import type { Database } from "@/types/database";

export type Customer =
  Database["public"]["Tables"]["customers"]["Row"];

export type CustomerStatus = Customer["status"];

export type CustomerFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialCustomerFormState: CustomerFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const customerStatusLabels: Record<CustomerStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};
