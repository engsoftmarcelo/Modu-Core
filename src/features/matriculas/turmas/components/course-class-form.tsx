"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { CourseClassDemoDefaults } from "@/features/matriculas/demo/defaults";
import { cn } from "@/lib/utils";

import type { CourseOption } from "../../cursos/queries";
import {
  createCourseClassAction,
  updateCourseClassAction,
} from "../actions";
import {
  initialCourseClassFormState,
  type CourseClassWithCourse,
  type CourseClassFormState,
  weekdays,
  weekdayLabels,
} from "../types";

type CourseClassFormProps = {
  courseClass?: CourseClassWithCourse;
  courses: CourseOption[];
  defaultCourseId?: string;
  demoDefaults?: CourseClassDemoDefaults;
  demoMode?: boolean;
  mode: "create" | "edit";
};

type FieldProps = {
  children: React.ReactNode;
  error?: string[];
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

function Field({ children, error, hint, label, name, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {hint && !error?.length ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
      {error?.map((message) => (
        <p key={message} className="text-sm font-medium text-red-600">
          {message}
        </p>
      ))}
    </div>
  );
}

function SubmitButton({ mode }: { mode: CourseClassFormProps["mode"] }) {
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
          ? "Criar turma"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function CourseClassForm({
  courseClass,
  courses,
  defaultCourseId,
  demoDefaults,
  demoMode = false,
  mode,
}: CourseClassFormProps) {
  const action =
    mode === "edit" && courseClass
      ? updateCourseClassAction.bind(null, courseClass.id)
      : createCourseClassAction;
  const [state, formAction] = useActionState<CourseClassFormState, FormData>(
    action,
    initialCourseClassFormState,
  );
  const cancelHref = courseClass
    ? `/matriculas/turmas/${courseClass.id}`
    : demoMode
      ? defaultCourseId
        ? `/matriculas/cursos/${defaultCourseId}?demo=1`
        : "/matriculas/demo"
      : "/matriculas/turmas";
  const selectedWeekdays = new Set(
    courseClass?.weekdays ?? demoDefaults?.weekdays ?? [],
  );

  return (
    <form action={formAction} noValidate className="space-y-7">
      {demoMode ? <input type="hidden" name="demo" value="1" /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Curso" name="courseId" required error={state.errors.courseId}>
            <select
              id="courseId"
              name="courseId"
              defaultValue={courseClass?.course_id ?? defaultCourseId ?? ""}
              className={cn(controlClassName, state.errors.courseId && "border-red-300")}
              required
            >
              <option value="">Selecione um curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Professor" name="teacher" required error={state.errors.teacher}>
          <input
            id="teacher"
            name="teacher"
            defaultValue={courseClass?.teacher ?? demoDefaults?.teacher}
            maxLength={160}
            placeholder="Nome do professor"
            className={cn(controlClassName, state.errors.teacher && "border-red-300")}
            required
          />
        </Field>

        <Field label="Horario" name="classTime" required error={state.errors.classTime}>
          <input
            id="classTime"
            name="classTime"
            type="time"
            defaultValue={
              courseClass?.class_time?.slice(0, 5) ??
              demoDefaults?.classTime ??
              "19:00"
            }
            className={cn(
              controlClassName,
              state.errors.classTime && "border-red-300",
            )}
            required
          />
        </Field>

        <Field
          label="Data de inicio"
          name="startDate"
          required
          error={state.errors.startDate}
        >
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={courseClass?.start_date ?? demoDefaults?.startDate}
            className={cn(
              controlClassName,
              state.errors.startDate && "border-red-300",
            )}
            required
          />
        </Field>

        <Field
          label="Data de fim"
          name="endDate"
          required
          error={state.errors.endDate}
        >
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={courseClass?.end_date ?? demoDefaults?.endDate}
            className={cn(controlClassName, state.errors.endDate && "border-red-300")}
            required
          />
        </Field>

        <Field label="Vagas" name="capacity" required error={state.errors.capacity}>
          <input
            id="capacity"
            name="capacity"
            type="number"
            inputMode="numeric"
            min="1"
            max="10000"
            step="1"
            defaultValue={courseClass?.capacity ?? demoDefaults?.capacity ?? 20}
            className={cn(controlClassName, state.errors.capacity && "border-red-300")}
            required
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700">
          Dias da semana <span className="text-red-500">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weekdays.map((weekday) => (
            <label
              key={weekday}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50 has-[:checked]:text-violet-700"
            >
              <input
                type="checkbox"
                name="weekdays"
                value={weekday}
                defaultChecked={selectedWeekdays.has(weekday)}
                className="size-4 rounded accent-violet-600"
              />
              {weekdayLabels[weekday]}
            </label>
          ))}
        </div>
        {state.errors.weekdays?.map((message) => (
          <p key={message} className="text-sm font-medium text-red-600">
            {message}
          </p>
        ))}
      </fieldset>

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
