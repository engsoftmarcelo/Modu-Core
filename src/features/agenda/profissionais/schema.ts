import { z } from "zod";

export const professionalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(160, "Use no maximo 160 caracteres."),
  specialty: z
    .string()
    .trim()
    .max(120, "Use no maximo 120 caracteres."),
  availableHours: z
    .string()
    .trim()
    .max(500, "Use no maximo 500 caracteres."),
  active: z
    .enum(["active", "inactive"], { message: "Selecione uma situacao valida." })
    .transform((value) => value === "active"),
  serviceIds: z
    .array(z.uuid("Selecione servicos validos."))
    .max(100, "Selecione no maximo 100 servicos."),
});

export function parseProfessionalForm(formData: FormData) {
  return professionalSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    specialty: String(formData.get("specialty") ?? ""),
    availableHours: String(formData.get("availableHours") ?? ""),
    active: String(formData.get("active") ?? "active"),
    serviceIds: formData
      .getAll("serviceIds")
      .map((value) => String(value))
      .filter(Boolean),
  });
}

export function nullable(value: string) {
  return value || null;
}
