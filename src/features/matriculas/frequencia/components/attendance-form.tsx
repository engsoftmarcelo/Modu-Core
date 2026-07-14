"use client";

import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

import { saveAttendanceAction } from "../actions";
import {
  attendanceStatusLabels,
  initialAttendanceFormState,
  type AttendanceFormState,
  type AttendanceStudent,
} from "../types";

type AttendanceFormProps = {
  classDate: string;
  courseClassId: string;
  demoEnrollmentId?: string;
  demoMode?: boolean;
  students: AttendanceStudent[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <LoaderCircle className="size-5 animate-spin" />
      ) : (
        <Save className="size-5" />
      )}
      {pending ? "Salvando..." : "Salvar frequencia"}
    </Button>
  );
}

export function AttendanceForm({
  classDate,
  courseClassId,
  demoEnrollmentId,
  demoMode = false,
  students,
}: AttendanceFormProps) {
  const [state, formAction] = useActionState<AttendanceFormState, FormData>(
    saveAttendanceAction,
    initialAttendanceFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="courseClassId" value={courseClassId} />
      <input type="hidden" name="classDate" value={classDate} />
      {demoMode ? <input type="hidden" name="demo" value="1" /> : null}
      {demoEnrollmentId ? (
        <input
          type="hidden"
          name="demoEnrollmentId"
          value={demoEnrollmentId}
        />
      ) : null}

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {students.map((student) => (
          <div
            key={student.enrollmentId}
            className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-950">{student.studentName}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                Aluno matriculado
              </p>
            </div>

            <input type="hidden" name="studentId" value={student.studentId} />
            <div className="grid grid-cols-2 gap-2 sm:w-72">
              {(["present", "absent"] as const).map((status) => (
                <label
                  key={status}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700"
                >
                  <input
                    type="radio"
                    name={`status:${student.studentId}`}
                    value={status}
                    defaultChecked={student.status === status}
                    className="sr-only"
                  />
                  {attendanceStatusLabels[status]}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
