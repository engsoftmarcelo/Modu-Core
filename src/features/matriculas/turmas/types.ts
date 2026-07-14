import type { Database } from "@/types/database";

export type CourseClass =
  Database["public"]["Tables"]["course_classes"]["Row"];

export type CourseClassWithCourse = CourseClass & {
  courseName: string | null;
};

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type CourseClassFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialCourseClassFormState: CourseClassFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const weekdayLabels: Record<Weekday, string> = {
  monday: "Segunda",
  tuesday: "Terca",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sabado",
  sunday: "Domingo",
};

export const weekdays: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
