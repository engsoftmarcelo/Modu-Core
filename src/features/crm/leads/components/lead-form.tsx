"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { createLeadAction, updateLeadAction } from "../actions";
import {
  initialLeadFormState,
  leadStatusLabels,
  leadStatuses,
  type Lead,
  type LeadFormState,
} from "../types";

type LeadFormProps = {
  lead?: Lead;
  mode: "create" | "edit";
};

type FieldProps = {
  error?: string[];
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

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

function SubmitButton({ mode }: { mode: LeadFormProps["mode"] }) {
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
          ? "Criar lead"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function LeadForm({ lead, mode }: LeadFormProps) {
  const action =
    mode === "edit" && lead
      ? updateLeadAction.bind(null, lead.id)
      : createLeadAction;
  const [state, formAction] = useActionState<LeadFormState, FormData>(
    action,
    initialLeadFormState,
  );
  const cancelHref = lead ? `/crm/leads/${lead.id}` : "/crm/leads";

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" required error={state.errors.name}>
          <input
            id="name"
            name="name"
            defaultValue={lead?.name}
            maxLength={160}
            autoComplete="name"
            placeholder="Nome do lead"
            className={cn(controlClassName, state.errors.name && "border-red-300")}
            required
          />
        </Field>

        <Field label="Empresa" name="company" error={state.errors.company}>
          <input
            id="company"
            name="company"
            defaultValue={lead?.company ?? ""}
            maxLength={160}
            autoComplete="organization"
            placeholder="Empresa ou nome fantasia"
            className={cn(
              controlClassName,
              state.errors.company && "border-red-300",
            )}
          />
        </Field>

        <Field label="Telefone" name="phone" error={state.errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={lead?.phone ?? ""}
            maxLength={30}
            autoComplete="tel"
            placeholder="(31) 99999-8888"
            className={cn(controlClassName, state.errors.phone && "border-red-300")}
          />
        </Field>

        <Field label="E-mail" name="email" error={state.errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={lead?.email ?? ""}
            maxLength={254}
            autoComplete="email"
            placeholder="contato@empresa.com.br"
            className={cn(controlClassName, state.errors.email && "border-red-300")}
          />
        </Field>

        <Field label="Origem" name="source" error={state.errors.source}>
          <input
            id="source"
            name="source"
            defaultValue={lead?.source ?? ""}
            maxLength={80}
            placeholder="Ex.: Indicacao, Instagram, Site"
            className={cn(controlClassName, state.errors.source && "border-red-300")}
          />
        </Field>

        <Field
          label="Valor estimado"
          name="estimatedValue"
          error={state.errors.estimatedValue}
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
              R$
            </span>
            <input
              id="estimatedValue"
              name="estimatedValue"
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              defaultValue={lead?.estimated_value ?? 0}
              className={cn(
                controlClassName,
                "pl-12",
                state.errors.estimatedValue && "border-red-300",
              )}
            />
          </div>
        </Field>

        <Field label="Status" name="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={lead?.status ?? "new"}
            className={cn(controlClassName, state.errors.status && "border-red-300")}
          >
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Observacoes" name="notes" error={state.errors.notes}>
        <textarea
          id="notes"
          name="notes"
          defaultValue={lead?.notes ?? ""}
          maxLength={2000}
          rows={6}
          placeholder="Necessidade, contexto da conversa e proximos passos..."
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
