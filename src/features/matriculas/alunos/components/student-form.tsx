"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { studentDemoDefaults } from "@/features/matriculas/demo/defaults";
import { cn } from "@/lib/utils";

import { createStudentAction, updateStudentAction } from "../actions";
import {
  initialStudentFormState,
  type Student,
  type StudentFormState,
} from "../types";

type StudentFormProps = {
  demoClassId?: string;
  demoMode?: boolean;
  mode: "create" | "edit";
  student?: Student;
};

type FieldProps = {
  children: React.ReactNode;
  error?: string[];
  label: string;
  name: string;
  required?: boolean;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

function Field({ children, error, label, name, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
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

function SubmitButton({ mode }: { mode: StudentFormProps["mode"] }) {
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
          ? "Cadastrar aluno"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function StudentForm({
  demoClassId,
  demoMode = false,
  mode,
  student,
}: StudentFormProps) {
  const action =
    mode === "edit" && student
      ? updateStudentAction.bind(null, student.id)
      : createStudentAction;
  const [state, formAction] = useActionState<StudentFormState, FormData>(
    action,
    initialStudentFormState,
  );
  const cancelHref = student
    ? `/matriculas/${student.id}`
    : demoMode
      ? demoClassId
        ? `/matriculas/inscricoes/novo?demo=1&classId=${encodeURIComponent(demoClassId)}`
        : "/matriculas/demo"
      : "/matriculas";
  const demoDefaults = demoMode && !student ? studentDemoDefaults : undefined;

  return (
    <form action={formAction} noValidate className="space-y-7">
      {demoMode ? <input type="hidden" name="demo" value="1" /> : null}
      {demoClassId ? (
        <input type="hidden" name="demoClassId" value={demoClassId} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" required error={state.errors.name}>
          <input
            id="name"
            name="name"
            defaultValue={student?.name ?? demoDefaults?.name}
            maxLength={160}
            autoComplete="name"
            placeholder="Nome do aluno"
            className={cn(controlClassName, state.errors.name && "border-red-300")}
            required
          />
        </Field>

        <Field label="WhatsApp" name="whatsapp" error={state.errors.whatsapp}>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={student?.whatsapp ?? demoDefaults?.whatsapp ?? ""}
            maxLength={30}
            autoComplete="tel"
            placeholder="(31) 99999-8888"
            className={cn(
              controlClassName,
              state.errors.whatsapp && "border-red-300",
            )}
          />
        </Field>

        <Field label="E-mail" name="email" error={state.errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={student?.email ?? demoDefaults?.email ?? ""}
            maxLength={254}
            autoComplete="email"
            placeholder="aluno@email.com"
            className={cn(controlClassName, state.errors.email && "border-red-300")}
          />
        </Field>

        <Field label="CPF opcional" name="cpf" error={state.errors.cpf}>
          <input
            id="cpf"
            name="cpf"
            inputMode="numeric"
            defaultValue={student?.cpf ?? ""}
            maxLength={20}
            placeholder="000.000.000-00"
            className={cn(controlClassName, state.errors.cpf && "border-red-300")}
          />
        </Field>

        <Field label="Status" name="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={student?.status ?? "active"}
            className={cn(controlClassName, state.errors.status && "border-red-300")}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </Field>
      </div>

      <Field label="Observacoes" name="notes" error={state.errors.notes}>
        <textarea
          id="notes"
          name="notes"
          defaultValue={student?.notes ?? demoDefaults?.notes ?? ""}
          maxLength={2000}
          rows={6}
          placeholder="Interesse, disponibilidade, turma desejada ou informacoes importantes..."
          className={cn(
            controlClassName,
            "resize-y py-3",
            state.errors.notes && "border-red-300",
          )}
        />
      </Field>

      {state.message && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.message}
        </p>
      )}

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
