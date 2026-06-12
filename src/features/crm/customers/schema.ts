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

export const customerSchema = z.object({
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
  whatsapp: optionalPhone,
  email: z
    .string()
    .trim()
    .max(254, "Use no maximo 254 caracteres.")
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Informe um e-mail valido.",
    ),
  segment: z
    .string()
    .trim()
    .max(80, "Use no maximo 80 caracteres."),
  notes: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
  status: z.enum(["active", "inactive"], {
    message: "Selecione um status valido.",
  }),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type CustomerField = keyof CustomerFormValues;

export function parseCustomerForm(formData: FormData) {
  return customerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    segment: String(formData.get("segment") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "active"),
  });
}

export function nullable(value: string) {
  return value || null;
}
