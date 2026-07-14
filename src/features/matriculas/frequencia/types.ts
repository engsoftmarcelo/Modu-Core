import type { Database } from "@/types/database";

export type AttendanceRecord =
  Database["public"]["Tables"]["attendance_records"]["Row"];

export type AttendanceStatus = AttendanceRecord["status"];

export type AttendanceStudent = {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
};

export type AttendanceFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialAttendanceFormState: AttendanceFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Presente",
  absent: "Ausente",
};
