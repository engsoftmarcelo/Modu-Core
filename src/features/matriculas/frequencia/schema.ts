import { z } from "zod";

const attendanceStatusSchema = z.enum(["present", "absent"]);

export const attendanceSchema = z.object({
  classDate: z.iso.date("Informe a data da aula."),
  courseClassId: z.uuid("Selecione uma turma valida."),
  records: z
    .array(
      z.object({
        status: attendanceStatusSchema,
        studentId: z.uuid("Aluno invalido."),
      }),
    )
    .min(1, "A turma precisa ter alunos matriculados para salvar frequencia."),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export function parseAttendanceForm(formData: FormData) {
  const studentIds = formData.getAll("studentId").map(String);
  const records = studentIds.map((studentId) => ({
    studentId,
    status: String(formData.get(`status:${studentId}`) ?? ""),
  }));

  return attendanceSchema.safeParse({
    classDate: String(formData.get("classDate") ?? ""),
    courseClassId: String(formData.get("courseClassId") ?? ""),
    records,
  });
}
