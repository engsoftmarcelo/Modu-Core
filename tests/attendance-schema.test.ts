import { describe, expect, it } from "vitest";

import { parseAttendanceForm } from "@/features/matriculas/frequencia/schema";

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

describe("schema de frequencia", () => {
  it("aceita turma, data e lista de alunos com presente/ausente", () => {
    const studentId = "00000000-0000-4000-8000-000000000401";
    const parsed = parseAttendanceForm(
      formData({
        classDate: "2026-08-10",
        courseClassId: "00000000-0000-4000-8000-000000000301",
        studentId,
        [`status:${studentId}`]: "present",
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.records).toEqual([
        {
          status: "present",
          studentId,
        },
      ]);
    }
  });

  it("rejeita chamada sem alunos e status invalido", () => {
    const studentId = "00000000-0000-4000-8000-000000000401";
    const empty = parseAttendanceForm(
      formData({
        classDate: "2026-08-10",
        courseClassId: "00000000-0000-4000-8000-000000000301",
      }),
    );
    const invalid = parseAttendanceForm(
      formData({
        classDate: "2026-08-10",
        courseClassId: "00000000-0000-4000-8000-000000000301",
        studentId,
        [`status:${studentId}`]: "atrasado",
      }),
    );

    expect(empty.success).toBe(false);
    expect(invalid.success).toBe(false);
  });
});
