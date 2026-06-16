import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(160, "Use no maximo 160 caracteres."),
  durationMinutes: z.coerce
    .number({ message: "Informe a duracao em minutos." })
    .int("Use minutos inteiros.")
    .min(1, "A duracao deve ser de pelo menos 1 minuto.")
    .max(1440, "A duracao nao pode passar de 24 horas."),
  price: z.coerce
    .number({ message: "Informe um preco valido." })
    .min(0, "O preco nao pode ser negativo.")
    .max(9999999999.99, "O preco informado e muito alto."),
  description: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
  active: z
    .enum(["active", "inactive"], { message: "Selecione uma situacao valida." })
    .transform((value) => value === "active"),
});

export function parseServiceForm(formData: FormData) {
  return serviceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    durationMinutes: String(formData.get("durationMinutes") ?? ""),
    price: String(formData.get("price") ?? "0"),
    description: String(formData.get("description") ?? ""),
    active: String(formData.get("active") ?? "active"),
  });
}

export function nullable(value: string) {
  return value || null;
}
