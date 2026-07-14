"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { courseDemoDefaults } from "@/features/matriculas/demo/defaults";
import { cn } from "@/lib/utils";

import { createCourseAction, updateCourseAction } from "../actions";
import {
  courseModalityLabels,
  initialCourseFormState,
  type Course,
  type CourseFormState,
  type CourseModality,
} from "../types";

type CourseFormProps = {
  course?: Course;
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

function SubmitButton({ mode }: { mode: CourseFormProps["mode"] }) {
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
          ? "Criar curso"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function CourseForm({
  course,
  demoMode = false,
  mode,
}: CourseFormProps) {
  const action =
    mode === "edit" && course
      ? updateCourseAction.bind(null, course.id)
      : createCourseAction;
  const [state, formAction] = useActionState<CourseFormState, FormData>(
    action,
    initialCourseFormState,
  );
  const cancelHref = course
    ? `/matriculas/cursos/${course.id}`
    : demoMode
      ? "/matriculas/demo"
      : "/matriculas/cursos";
  const modalities = Object.keys(courseModalityLabels) as CourseModality[];
  const demoDefaults = demoMode && !course ? courseDemoDefaults : undefined;

  return (
    <form action={formAction} noValidate className="space-y-7">
      {demoMode ? <input type="hidden" name="demo" value="1" /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Nome do curso"
            name="name"
            required
            error={state.errors.name}
          >
            <input
              id="name"
              name="name"
              defaultValue={course?.name ?? demoDefaults?.name}
              maxLength={160}
              placeholder="Ex.: Informatica basica, Corte e costura"
              className={cn(controlClassName, state.errors.name && "border-red-300")}
              required
            />
          </Field>
        </div>

        <Field
          label="Carga horaria"
          name="workloadHours"
          required
          hint="Informe o total de horas do curso."
          error={state.errors.workloadHours}
        >
          <input
            id="workloadHours"
            name="workloadHours"
            type="number"
            inputMode="numeric"
            min="1"
            max="10000"
            step="1"
            defaultValue={
              course?.workload_hours ?? demoDefaults?.workloadHours ?? 40
            }
            className={cn(
              controlClassName,
              state.errors.workloadHours && "border-red-300",
            )}
            required
          />
        </Field>

        <Field label="Preco" name="price" required error={state.errors.price}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
              R$
            </span>
            <input
              id="price"
              name="price"
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              defaultValue={course?.price ?? demoDefaults?.price ?? 0}
              className={cn(
                controlClassName,
                "pl-12",
                state.errors.price && "border-red-300",
              )}
              required
            />
          </div>
        </Field>

        <Field label="Modalidade" name="modality" error={state.errors.modality}>
          <select
            id="modality"
            name="modality"
            defaultValue={
              course?.modality ?? demoDefaults?.modality ?? "presencial"
            }
            className={cn(controlClassName, state.errors.modality && "border-red-300")}
          >
            {modalities.map((modality) => (
              <option key={modality} value={modality}>
                {courseModalityLabels[modality]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Situacao" name="active" error={state.errors.active}>
          <select
            id="active"
            name="active"
            defaultValue={
              course ? (course.active ? "active" : "inactive") : "active"
            }
            className={cn(controlClassName, state.errors.active && "border-red-300")}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </Field>
      </div>

      <Field
        label="Descricao"
        name="description"
        error={state.errors.description}
      >
        <textarea
          id="description"
          name="description"
          defaultValue={course?.description ?? demoDefaults?.description ?? ""}
          maxLength={2000}
          rows={5}
          placeholder="Resumo do curso, publico-alvo, conteudo e diferenciais..."
          className={cn(
            controlClassName,
            "resize-y py-3",
            state.errors.description && "border-red-300",
          )}
        />
      </Field>

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
