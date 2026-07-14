import { describe, expect, it } from "vitest";

import { parseStudentForm } from "@/features/matriculas/alunos/schema";

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

describe("schema de alunos", () => {
  it("aceita o cadastro essencial com CPF opcional vazio", () => {
    const parsed = parseStudentForm(
      formData({
        name: "Ana Curso",
        whatsapp: "(31) 99999-8888",
        email: "ana@example.com",
        cpf: "",
        notes: "Interessada na turma de sabado.",
        status: "active",
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        name: "Ana Curso",
        cpf: "",
        status: "active",
      });
    }
  });

  it("rejeita CPF preenchido com quantidade invalida de digitos", () => {
    const parsed = parseStudentForm(
      formData({
        name: "Ana Curso",
        whatsapp: "(31) 99999-8888",
        email: "ana@example.com",
        cpf: "123",
        notes: "",
        status: "active",
      }),
    );

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.cpf).toContain(
        "Informe um CPF com 11 digitos.",
      );
    }
  });
});
