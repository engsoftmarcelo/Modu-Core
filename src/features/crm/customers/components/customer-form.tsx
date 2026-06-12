"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  createCustomerAction,
  updateCustomerAction,
} from "../actions";
import {
  initialCustomerFormState,
  type Customer,
  type CustomerFormState,
} from "../types";

type CustomerFormProps = {
  customer?: Customer;
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

function SubmitButton({ mode }: { mode: CustomerFormProps["mode"] }) {
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
          ? "Criar cliente"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const action =
    mode === "edit" && customer
      ? updateCustomerAction.bind(null, customer.id)
      : createCustomerAction;
  const [state, formAction] = useActionState<CustomerFormState, FormData>(
    action,
    initialCustomerFormState,
  );
  const cancelHref = customer ? `/crm/${customer.id}` : "/crm";

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" required error={state.errors.name}>
          <input
            id="name"
            name="name"
            defaultValue={customer?.name}
            maxLength={160}
            autoComplete="name"
            placeholder="Nome do cliente"
            className={cn(controlClassName, state.errors.name && "border-red-300")}
            required
          />
        </Field>

        <Field label="Empresa" name="company" error={state.errors.company}>
          <input
            id="company"
            name="company"
            defaultValue={customer?.company ?? ""}
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
            defaultValue={customer?.phone ?? ""}
            maxLength={30}
            autoComplete="tel"
            placeholder="(31) 3333-4444"
            className={cn(controlClassName, state.errors.phone && "border-red-300")}
          />
        </Field>

        <Field label="WhatsApp" name="whatsapp" error={state.errors.whatsapp}>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={customer?.whatsapp ?? ""}
            maxLength={30}
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
            defaultValue={customer?.email ?? ""}
            maxLength={254}
            autoComplete="email"
            placeholder="contato@empresa.com.br"
            className={cn(controlClassName, state.errors.email && "border-red-300")}
          />
        </Field>

        <Field label="Segmento" name="segment" error={state.errors.segment}>
          <input
            id="segment"
            name="segment"
            defaultValue={customer?.segment ?? ""}
            maxLength={80}
            placeholder="Ex.: Consultoria, Saude, Educacao"
            className={cn(
              controlClassName,
              state.errors.segment && "border-red-300",
            )}
          />
        </Field>

        <Field label="Status" name="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={customer?.status ?? "active"}
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
          defaultValue={customer?.notes ?? ""}
          maxLength={2000}
          rows={6}
          placeholder="Contexto, preferencias, historico ou informacoes importantes..."
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
