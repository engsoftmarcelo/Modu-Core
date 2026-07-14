import { describe, expect, it } from "vitest";

import { parseCourseClassForm } from "@/features/matriculas/turmas/schema";

function formData(values: Record<string, string | string[]>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => data.append(key, item));
      return;
    }

    data.set(key, value);
  });

  return data;
}

describe("schema de turmas", () => {
  it("aceita turma com curso, professor, periodo, dias, horario e vagas", () => {
    const parsed = parseCourseClassForm(
      formData({
        courseId: "00000000-0000-4000-8000-000000000101",
        teacher: "Marina Souza",
        startDate: "2026-08-01",
        endDate: "2026-10-01",
        weekdays: ["monday", "wednesday"],
        classTime: "19:30",
        capacity: "24",
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        capacity: 24,
        classTime: "19:30",
        teacher: "Marina Souza",
        weekdays: ["monday", "wednesday"],
      });
    }
  });

  it("rejeita data final anterior ao inicio e turma sem dia da semana", () => {
    const parsed = parseCourseClassForm(
      formData({
        courseId: "00000000-0000-4000-8000-000000000101",
        teacher: "Marina Souza",
        startDate: "2026-10-01",
        endDate: "2026-08-01",
        weekdays: [],
        classTime: "19:30",
        capacity: "0",
      }),
    );

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      expect(errors.endDate).toContain(
        "A data de fim deve ser igual ou posterior ao inicio.",
      );
      expect(errors.weekdays).toContain("Selecione pelo menos um dia da semana.");
      expect(errors.capacity).toContain("A turma precisa ter pelo menos 1 vaga.");
    }
  });
});
