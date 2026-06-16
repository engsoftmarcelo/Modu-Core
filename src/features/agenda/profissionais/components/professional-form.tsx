"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { createProfessionalAction, updateProfessionalAction } from "../actions";
import {
  initialProfessionalFormState,
  type ProfessionalFormState,
  type ProfessionalWithServices,
  type ServiceOption,
} from "../types";

type ProfessionalFormProps = {
  mode: "create" | "edit";
  options: ServiceOption[];
  professional?: ProfessionalWithServices;
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
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

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

function SubmitButton({ mode }: { mode: ProfessionalFormProps["mode"] }) {
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
          ? "Criar profissional"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function ProfessionalForm({
  mode,
  options,
  professional,
}: ProfessionalFormProps) {
  const action =
    mode === "edit" && professional
      ? updateProfessionalAction.bind(null, professional.id)
      : createProfessionalAction;
  const [state, formAction] = useActionState<ProfessionalFormState, FormData>(
    action,
    initialProfessionalFormState,
  );
  const cancelHref = professional
    ? `/agenda/profissionais/${professional.id}`
    : "/agenda/profissionais";
  const selectedIds = new Set(
    professional?.services.map((service) => service.id) ?? [],
  );

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" required error={state.errors.name}>
          <input
            id="name"
            name="name"
            defaultValue={professional?.name}
            maxLength={160}
            autoComplete="name"
            placeholder="Nome do profissional"
            className={cn(controlClassName, state.errors.name && "border-red-300")}
            required
          />
        </Field>

        <Field
          label="Especialidade"
          name="specialty"
          error={state.errors.specialty}
        >
          <input
            id="specialty"
            name="specialty"
            defaultValue={professional?.specialty ?? ""}
            maxLength={120}
            placeholder="Ex.: Cabeleireiro, Esteticista, Manicure"
            className={cn(
              controlClassName,
              state.errors.specialty && "border-red-300",
            )}
          />
        </Field>

        <Field
          label="Horario disponivel"
          name="availableHours"
          hint="Texto livre. Ex.: Seg a Sex, 9h as 18h. Sab, 9h as 13h."
          error={state.errors.availableHours}
        >
          <textarea
            id="availableHours"
            name="availableHours"
            defaultValue={professional?.available_hours ?? ""}
            maxLength={500}
            rows={4}
            placeholder="Seg a Sex, 9h as 18h"
            className={cn(
              controlClassName,
              "min-h-28 resize-y py-3",
              state.errors.availableHours && "border-red-300",
            )}
          />
        </Field>

        <Field label="Situacao" name="active" error={state.errors.active}>
          <select
            id="active"
            name="active"
            defaultValue={
              professional
                ? professional.active
                  ? "active"
                  : "inactive"
                : "active"
            }
            className={cn(controlClassName, state.errors.active && "border-red-300")}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </Field>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Servicos que realiza
        </p>
        {options.length ? (
          <div
            className={cn(
              "grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-2",
              state.errors.serviceIds && "border-red-300",
            )}
          >
            {options.map((service) => (
              <label
                key={service.id}
                className="flex items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-2.5 text-sm font-semibold text-ink-950 shadow-sm transition hover:border-violet-200 has-[:checked]:border-violet-300 has-[:checked]:bg-violet-50"
              >
                <input
                  type="checkbox"
                  name="serviceIds"
                  value={service.id}
                  defaultChecked={selectedIds.has(service.id)}
                  className="size-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="min-w-0 flex-1 truncate">{service.name}</span>
                {!service.active ? (
                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    inativo
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum servico cadastrado.{" "}
            <Link
              href="/agenda/servicos/novo"
              className="font-semibold text-violet-700 hover:underline"
            >
              Cadastre um servico
            </Link>{" "}
            para vincular ao profissional.
          </p>
        )}
        {state.errors.serviceIds?.map((message) => (
          <p key={message} className="text-sm font-medium text-red-600">
            {message}
          </p>
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
