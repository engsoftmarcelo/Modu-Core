import { z } from "zod";

import { weekdays } from "./types";

const weekdaySchema = z.enum(weekdays);

export const courseClassSchema = z
  .object({
    courseId: z.uuid("Selecione um curso valido."),
    teacher: z
      .string()
      .trim()
      .min(2, "Informe pelo menos 2 caracteres.")
      .max(160, "Use no maximo 160 caracteres."),
    startDate: z.iso.date("Informe a data de inicio."),
    endDate: z.iso.date("Informe a data de fim."),
    weekdays: z
      .array(weekdaySchema)
      .min(1, "Selecione pelo menos um dia da semana."),
    classTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horario valido."),
    capacity: z.coerce
      .number({ message: "Informe a quantidade de vagas." })
      .int("Use um numero inteiro.")
      .min(1, "A turma precisa ter pelo menos 1 vaga.")
      .max(10000, "A quantidade de vagas e muito alta."),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "A data de fim deve ser igual ou posterior ao inicio.",
    path: ["endDate"],
  });

export type CourseClassFormValues = z.infer<typeof courseClassSchema>;

export function parseCourseClassForm(formData: FormData) {
  return courseClassSchema.safeParse({
    courseId: String(formData.get("courseId") ?? ""),
    teacher: String(formData.get("teacher") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    weekdays: formData.getAll("weekdays").map(String),
    classTime: String(formData.get("classTime") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
  });
}
