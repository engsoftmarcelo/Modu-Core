import { z } from "zod";

export const courseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(160, "Use no maximo 160 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
  workloadHours: z.coerce
    .number({ message: "Informe a carga horaria." })
    .int("Use horas inteiras.")
    .min(1, "A carga horaria deve ter pelo menos 1 hora.")
    .max(10000, "A carga horaria informada e muito alta."),
  price: z.coerce
    .number({ message: "Informe um preco valido." })
    .min(0, "O preco nao pode ser negativo.")
    .max(9999999999.99, "O preco informado e muito alto."),
  modality: z.enum(["presencial", "online", "hibrido"], {
    message: "Selecione uma modalidade valida.",
  }),
  active: z
    .enum(["active", "inactive"], { message: "Selecione uma situacao valida." })
    .transform((value) => value === "active"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export function parseCourseForm(formData: FormData) {
  return courseSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    workloadHours: String(formData.get("workloadHours") ?? ""),
    price: String(formData.get("price") ?? "0"),
    modality: String(formData.get("modality") ?? "presencial"),
    active: String(formData.get("active") ?? "active"),
  });
}

export function nullable(value: string) {
  return value || null;
}
