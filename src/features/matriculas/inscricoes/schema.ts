import { z } from "zod";

import { enrollmentStatuses } from "./types";

const enrollmentStatusSchema = z.enum(enrollmentStatuses);

export const enrollmentSchema = z.object({
  studentId: z.uuid("Selecione um aluno valido."),
  courseClassId: z.uuid("Selecione uma turma valida."),
  status: enrollmentStatusSchema,
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

export function parseEnrollmentForm(formData: FormData) {
  return enrollmentSchema.safeParse({
    studentId: String(formData.get("studentId") ?? ""),
    courseClassId: String(formData.get("courseClassId") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
}
