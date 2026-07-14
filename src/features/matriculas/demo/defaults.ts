import type { CourseModality } from "@/features/matriculas/cursos/types";
import type { Weekday } from "@/features/matriculas/turmas/types";

export const courseDemoDefaults = {
  description:
    "Curso pratico para desenvolver habilidades digitais usadas no dia a dia profissional.",
  modality: "presencial" as CourseModality,
  name: "Informatica para o trabalho",
  price: 497,
  workloadHours: 40,
};

export const studentDemoDefaults = {
  email: "ana.souza@example.com",
  name: "Ana Souza",
  notes: "Interessada em desenvolver habilidades para o mercado de trabalho.",
  whatsapp: "(31) 99999-8888",
};

export type CourseClassDemoDefaults = {
  capacity: number;
  classTime: string;
  endDate: string;
  startDate: string;
  teacher: string;
  weekdays: Weekday[];
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getCourseClassDemoDefaults(
  referenceDate = new Date(),
): CourseClassDemoDefaults {
  const startDate = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  const daysUntilMonday = ((8 - startDate.getUTCDay()) % 7) || 7;
  startDate.setUTCDate(startDate.getUTCDate() + daysUntilMonday);

  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 56);

  return {
    capacity: 20,
    classTime: "19:00",
    endDate: isoDate(endDate),
    startDate: isoDate(startDate),
    teacher: "Camila Rocha",
    weekdays: ["monday", "wednesday"],
  };
}
