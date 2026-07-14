import { describe, expect, it } from "vitest";

import { parseEnrollmentForm } from "@/features/matriculas/inscricoes/schema";

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

describe("schema de matriculas", () => {
  it("aceita aluno, turma e status da matricula", () => {
    const parsed = parseEnrollmentForm(
      formData({
        studentId: "00000000-0000-4000-8000-000000000201",
        courseClassId: "00000000-0000-4000-8000-000000000301",
        status: "enrolled",
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        courseClassId: "00000000-0000-4000-8000-000000000301",
        status: "enrolled",
        studentId: "00000000-0000-4000-8000-000000000201",
      });
    }
  });

  it("rejeita status fora da lista e ids invalidos", () => {
    const parsed = parseEnrollmentForm(
      formData({
        studentId: "aluno",
        courseClassId: "turma",
        status: "aguardando",
      }),
    );

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      expect(errors.studentId).toContain("Selecione um aluno valido.");
      expect(errors.courseClassId).toContain("Selecione uma turma valida.");
      expect(errors.status).toBeDefined();
    }
  });
});
