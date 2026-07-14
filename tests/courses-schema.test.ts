import { describe, expect, it } from "vitest";

import { parseCourseForm } from "@/features/matriculas/cursos/schema";

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

describe("schema de cursos", () => {
  it("aceita o cadastro essencial de curso ativo", () => {
    const parsed = parseCourseForm(
      formData({
        name: "Informatica basica",
        description: "Curso para iniciantes.",
        workloadHours: "40",
        price: "497.90",
        modality: "presencial",
        active: "active",
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        active: true,
        modality: "presencial",
        name: "Informatica basica",
        price: 497.9,
        workloadHours: 40,
      });
    }
  });

  it("rejeita modalidade invalida e carga horaria zerada", () => {
    const parsed = parseCourseForm(
      formData({
        name: "Informatica basica",
        description: "",
        workloadHours: "0",
        price: "0",
        modality: "gravado",
        active: "active",
      }),
    );

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      expect(errors.workloadHours).toContain(
        "A carga horaria deve ter pelo menos 1 hora.",
      );
      expect(errors.modality).toContain("Selecione uma modalidade valida.");
    }
  });
});
