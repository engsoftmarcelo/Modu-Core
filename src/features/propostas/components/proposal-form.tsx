"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { createProposalAction, updateProposalAction } from "../actions";
import {
  initialProposalFormState,
  proposalStatusLabels,
  proposalStatuses,
  type Proposal,
  type ProposalCustomerOption,
  type ProposalFormState,
} from "../types";

type ProposalFormProps = {
  initialCustomerId?: string;
  mode: "create" | "edit";
  options: ProposalCustomerOption[];
  proposal?: Proposal;
};

type FieldProps = {
  children: React.ReactNode;
  error?: string[];
  label: string;
  name: string;
  required?: boolean;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

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

function SubmitButton({ mode }: { mode: ProposalFormProps["mode"] }) {
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
          ? "Criar proposta"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function ProposalForm({
  initialCustomerId = "",
  mode,
  options,
  proposal,
}: ProposalFormProps) {
  const action =
    mode === "edit" && proposal
      ? updateProposalAction.bind(null, proposal.id)
      : createProposalAction;
  const [state, formAction] = useActionState<ProposalFormState, FormData>(
    action,
    initialProposalFormState,
  );
  const cancelHref = proposal ? `/propostas/${proposal.id}` : "/propostas";

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Titulo" name="title" required error={state.errors.title}>
            <input
              id="title"
              name="title"
              defaultValue={proposal?.title}
              maxLength={180}
              placeholder="Ex.: Identidade visual e site institucional"
              className={cn(
                controlClassName,
                state.errors.title && "border-red-300",
              )}
              required
            />
          </Field>
        </div>

        <Field
          label="Cliente"
          name="customerId"
          required
          error={state.errors.customerId}
        >
          <select
            id="customerId"
            name="customerId"
            defaultValue={proposal?.customer_id ?? initialCustomerId}
            className={cn(
              controlClassName,
              state.errors.customerId && "border-red-300",
            )}
            required
          >
            <option value="">Selecione um cliente</option>
            {options.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.label}
              </option>
            ))}
          </select>
          {!options.length ? (
            <p className="text-sm text-slate-500">
              Nenhum cliente cadastrado ainda.{" "}
              <Link
                href="/crm/novo"
                className="font-semibold text-brand-700 hover:underline"
              >
                Cadastre o primeiro cliente
              </Link>{" "}
              para criar a proposta.
            </p>
          ) : null}
        </Field>

        <Field label="Valor" name="value" required error={state.errors.value}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
              R$
            </span>
            <input
              id="value"
              name="value"
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              defaultValue={proposal?.total ?? 0}
              className={cn(
                controlClassName,
                "pl-12",
                state.errors.value && "border-red-300",
              )}
              required
            />
          </div>
        </Field>

        <Field
          label="Prazo de validade"
          name="validUntil"
          required
          error={state.errors.validUntil}
        >
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            defaultValue={proposal?.valid_until ?? ""}
            className={cn(
              controlClassName,
              state.errors.validUntil && "border-red-300",
            )}
            required
          />
        </Field>

        <Field label="Status" name="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={proposal?.status ?? "draft"}
            className={cn(
              controlClassName,
              state.errors.status && "border-red-300",
            )}
          >
            {proposalStatuses.map((status) => (
              <option key={status} value={status}>
                {proposalStatusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Servicos"
        name="services"
        required
        error={state.errors.services}
      >
        <textarea
          id="services"
          name="services"
          defaultValue={proposal?.services ?? ""}
          maxLength={2000}
          rows={6}
          placeholder="Liste os servicos incluidos, escopo e entregaveis..."
          className={cn(
            controlClassName,
            "resize-y py-3",
            state.errors.services && "border-red-300",
          )}
          required
        />
      </Field>

      <Field label="Observacoes" name="notes" error={state.errors.notes}>
        <textarea
          id="notes"
          name="notes"
          defaultValue={proposal?.notes ?? ""}
          maxLength={2000}
          rows={4}
          placeholder="Condicoes de pagamento, forma de entrega e combinados..."
          className={cn(
            controlClassName,
            "resize-y py-3",
            state.errors.notes && "border-red-300",
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
