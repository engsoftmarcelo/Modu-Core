import { z } from "zod";

const optionalPhone = z
  .string()
  .trim()
  .max(30, "Use no maximo 30 caracteres.")
  .refine((value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }, "Informe um WhatsApp valido.");

const optionalCpf = z
  .string()
  .trim()
  .max(20, "Use no maximo 20 caracteres.")
  .refine((value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, "");
    return digits.length === 11;
  }, "Informe um CPF com 11 digitos.");

export const studentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(160, "Use no maximo 160 caracteres."),
  whatsapp: optionalPhone,
  email: z
    .string()
    .trim()
    .max(254, "Use no maximo 254 caracteres.")
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Informe um e-mail valido.",
    ),
  cpf: optionalCpf,
  notes: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
  status: z.enum(["active", "inactive"], {
    message: "Selecione um status valido.",
  }),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export function parseStudentForm(formData: FormData) {
  return studentSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    cpf: String(formData.get("cpf") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "active"),
  });
}

export function nullable(value: string) {
  return value || null;
}
