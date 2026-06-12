import { z } from "zod";

const optionalPhone = z
  .string()
  .trim()
  .max(30, "Use no maximo 30 caracteres.")
  .refine((value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }, "Informe um telefone valido.");

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(160, "Use no maximo 160 caracteres."),
  company: z
    .string()
    .trim()
    .max(160, "Use no maximo 160 caracteres."),
  phone: optionalPhone,
  email: z
    .string()
    .trim()
    .max(254, "Use no maximo 254 caracteres.")
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Informe um e-mail valido.",
    ),
  source: z
    .string()
    .trim()
    .max(80, "Use no maximo 80 caracteres."),
  status: z.enum(
    ["new", "contacted", "proposal_sent", "negotiation", "won", "lost"],
    { message: "Selecione um status valido." },
  ),
  estimatedValue: z.coerce
    .number({ message: "Informe um valor valido." })
    .min(0, "O valor nao pode ser negativo.")
    .max(9999999999.99, "O valor informado e muito alto."),
  notes: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
});

export function parseLeadForm(formData: FormData) {
  return leadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    source: String(formData.get("source") ?? ""),
    status: String(formData.get("status") ?? "new"),
    estimatedValue: String(formData.get("estimatedValue") ?? "0"),
    notes: String(formData.get("notes") ?? ""),
  });
}

export function nullable(value: string) {
  return value || null;
}
