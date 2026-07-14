"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { createServiceAction, updateServiceAction } from "../actions";
import {
  initialServiceFormState,
  type Service,
  type ServiceFormState,
} from "../types";

type ServiceFormProps = {
  mode: "create" | "edit";
  service?: Service;
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
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

function Field({ children, error, hint, label, name, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {hint && !error?.length ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
      {error?.map((message) => (
        <p key={message} className="text-sm font-medium text-red-600">
          {message}
        </p>
      ))}
    </div>
  );
}

function SubmitButton({ mode }: { mode: ServiceFormProps["mode"] }) {
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
          ? "Criar servico"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const action =
    mode === "edit" && service
      ? updateServiceAction.bind(null, service.id)
      : createServiceAction;
  const [state, formAction] = useActionState<ServiceFormState, FormData>(
    action,
    initialServiceFormState,
  );
  const cancelHref = service
    ? `/agenda/servicos/${service.id}`
    : "/agenda/servicos";

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nome do servico" name="name" required error={state.errors.name}>
            <input
              id="name"
              name="name"
              defaultValue={service?.name}
              maxLength={160}
              placeholder="Ex.: Corte feminino, Limpeza de pele"
              className={cn(controlClassName, state.errors.name && "border-red-300")}
              required
            />
          </Field>
        </div>

        <Field
          label="Duracao (minutos)"
          name="durationMinutes"
          required
          hint="Usada para montar a agenda e os horarios disponiveis."
          error={state.errors.durationMinutes}
        >
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            inputMode="numeric"
            min="1"
            max="1440"
            step="5"
            defaultValue={service?.duration_minutes ?? 30}
            className={cn(
              controlClassName,
              state.errors.durationMinutes && "border-red-300",
            )}
            required
          />
        </Field>

        <Field label="Preco" name="price" required error={state.errors.price}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-500">
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
              defaultValue={service?.price ?? 0}
              className={cn(
                controlClassName,
                "pl-12",
                state.errors.price && "border-red-300",
              )}
              required
            />
          </div>
        </Field>

        <Field label="Situacao" name="active" error={state.errors.active}>
          <select
            id="active"
            name="active"
            defaultValue={
              service ? (service.active ? "active" : "inactive") : "active"
            }
            className={cn(controlClassName, state.errors.active && "border-red-300")}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </Field>
      </div>

      <Field label="Descricao" name="description" error={state.errors.description}>
        <textarea
          id="description"
          name="description"
          defaultValue={service?.description ?? ""}
          maxLength={2000}
          rows={5}
          placeholder="O que esta incluso, materiais, cuidados e observacoes..."
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
