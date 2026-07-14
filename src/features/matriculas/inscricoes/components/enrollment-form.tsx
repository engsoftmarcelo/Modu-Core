"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { StudentOption } from "@/features/matriculas/alunos/queries";
import type { CourseClassOption } from "@/features/matriculas/turmas/queries";
import { cn } from "@/lib/utils";

import {
  createEnrollmentAction,
  updateEnrollmentAction,
} from "../actions";
import {
  enrollmentStatusLabels,
  enrollmentStatuses,
  initialEnrollmentFormState,
  type EnrollmentFormState,
  type EnrollmentWithRelations,
} from "../types";

type EnrollmentFormProps = {
  classes: CourseClassOption[];
  defaultClassId?: string;
  defaultStudentId?: string;
  demoMode?: boolean;
  enrollment?: EnrollmentWithRelations;
  mode: "create" | "edit";
  students: StudentOption[];
};

type FieldProps = {
  children: React.ReactNode;
  error?: string[];
  label: string;
  name: string;
  required?: boolean;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

function Field({ children, error, label, name, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {error?.map((message) => (
        <p key={message} className="text-sm font-medium text-red-600">
          {message}
        </p>
      ))}
    </div>
  );
}

function SubmitButton({ mode }: { mode: EnrollmentFormProps["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <LoaderCircle className="size-5 animate-spin" />
      ) : (
        <Save className="size-5" />
      )}
      {pending
        ? "Salvando..."
        : mode === "create"
          ? "Criar matricula"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function EnrollmentForm({
  classes,
  defaultClassId,
  defaultStudentId,
  demoMode = false,
  enrollment,
  mode,
  students,
}: EnrollmentFormProps) {
  const action =
    mode === "edit" && enrollment
      ? updateEnrollmentAction.bind(null, enrollment.id)
      : createEnrollmentAction;
  const [state, formAction] = useActionState<EnrollmentFormState, FormData>(
    action,
    initialEnrollmentFormState,
  );
  const cancelHref = enrollment
    ? `/matriculas/inscricoes/${enrollment.id}`
    : demoMode
      ? defaultClassId
        ? `/matriculas/turmas/${defaultClassId}?demo=1`
        : "/matriculas/demo"
      : "/matriculas/inscricoes";

  return (
    <form action={formAction} noValidate className="space-y-7">
      {demoMode ? <input type="hidden" name="demo" value="1" /> : null}

      <div className="grid gap-5">
        <Field label="Aluno" name="studentId" required error={state.errors.studentId}>
          <select
            id="studentId"
            name="studentId"
            defaultValue={enrollment?.student_id ?? defaultStudentId ?? ""}
            className={cn(controlClassName, state.errors.studentId && "border-red-300")}
            required
          >
            <option value="">Selecione um aluno</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Turma"
          name="courseClassId"
          required
          error={state.errors.courseClassId}
        >
          <select
            id="courseClassId"
            name="courseClassId"
            defaultValue={enrollment?.course_class_id ?? defaultClassId ?? ""}
            className={cn(
              controlClassName,
              state.errors.courseClassId && "border-red-300",
            )}
            required
          >
            <option value="">Selecione uma turma</option>
            {classes.map((courseClass) => (
              <option key={courseClass.id} value={courseClass.id}>
                {courseClass.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" name="status" required error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={
              enrollment?.status ?? (demoMode ? "enrolled" : "interested")
            }
            className={cn(controlClassName, state.errors.status && "border-red-300")}
            required
          >
            {enrollmentStatuses.map((status) => (
              <option key={status} value={status}>
                {enrollmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex min-h-14 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-ink-950 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
