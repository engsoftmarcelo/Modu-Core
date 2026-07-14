"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

import { saveWorkOrderQuoteAction } from "../actions";
import {
  calculateWorkOrderQuoteTotal,
  initialWorkOrderQuoteFormState,
  type WorkOrderQuoteFormState,
} from "../types";

type WorkOrderQuoteFormProps = {
  hasQuote: boolean;
  initialDiscount: number;
  initialLabor: number;
  initialMaterials: number;
  initialTerm: string;
  workOrderId: string;
};

type MoneyFieldProps = {
  error?: string[];
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

function initialMoneyValue(value: number, hasQuote: boolean) {
  if (!hasQuote && value === 0) {
    return "";
  }

  return value.toFixed(2);
}

function numericValue(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function MoneyField({
  error,
  label,
  name,
  onChange,
  value,
}: MoneyFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-bold text-slate-500">
          R$
        </span>
        <input
          id={name}
          name={name}
          type="number"
          min="0"
          max="9999999999.99"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder="0,00"
          className={cn(
            controlClassName,
            "pl-12 tabular-nums",
            error && "border-red-300",
          )}
        />
      </div>
      {error?.map((message) => (
        <p
          key={message}
          id={errorId}
          className="text-sm font-medium text-red-600"
        >
          {message}
        </p>
      ))}
    </div>
  );
}

function QuoteSubmitButton({ hasQuote }: { hasQuote: boolean }) {
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
        : hasQuote
          ? "Atualizar orcamento"
          : "Salvar orcamento"}
    </Button>
  );
}

export function WorkOrderQuoteForm({
  hasQuote,
  initialDiscount,
  initialLabor,
  initialMaterials,
  initialTerm,
  workOrderId,
}: WorkOrderQuoteFormProps) {
  const [materials, setMaterials] = useState(() =>
    initialMoneyValue(initialMaterials, hasQuote),
  );
  const [labor, setLabor] = useState(() =>
    initialMoneyValue(initialLabor, hasQuote),
  );
  const [discount, setDiscount] = useState(() =>
    initialMoneyValue(initialDiscount, true),
  );
  const [state, formAction] = useActionState<
    WorkOrderQuoteFormState,
    FormData
  >(
    saveWorkOrderQuoteAction.bind(null, workOrderId),
    initialWorkOrderQuoteFormState,
  );
  const total = useMemo(
    () =>
      calculateWorkOrderQuoteTotal(
        numericValue(materials),
        numericValue(labor),
        numericValue(discount),
      ),
    [discount, labor, materials],
  );

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MoneyField
          label="Materiais"
          name="materials"
          value={materials}
          onChange={setMaterials}
          error={state.errors.materials}
        />
        <MoneyField
          label="Mao de obra"
          name="labor"
          value={labor}
          onChange={setLabor}
          error={state.errors.labor}
        />
        <MoneyField
          label="Desconto"
          name="discount"
          value={discount}
          onChange={setDiscount}
          error={state.errors.discount}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
        <div className="space-y-2">
          <label htmlFor="term" className="text-sm font-semibold text-slate-700">
            Prazo
          </label>
          <input
            id="term"
            name="term"
            defaultValue={initialTerm}
            maxLength={160}
            placeholder="Ex.: 5 dias uteis apos aprovacao"
            aria-invalid={Boolean(state.errors.term)}
            aria-describedby={state.errors.term ? "term-error" : undefined}
            className={cn(
              controlClassName,
              state.errors.term && "border-red-300",
            )}
          />
          {state.errors.term?.map((message) => (
            <p
              key={message}
              id="term-error"
              className="text-sm font-medium text-red-600"
            >
              {message}
            </p>
          ))}
        </div>

        <div className="flex min-h-20 items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:block">
          <p className="text-xs font-bold uppercase text-emerald-700">
            Valor total
          </p>
          <output className="text-xl font-bold tabular-nums text-ink-950 sm:mt-1 sm:block">
            {formatCurrency(total, 2)}
          </output>
        </div>
      </div>

      {state.message ? (
        <div
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
            state.status === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700",
          )}
        >
          {state.status === "success" ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <CircleAlert className="size-5 shrink-0" />
          )}
          {state.message}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <QuoteSubmitButton hasQuote={hasQuote} />
      </div>
    </form>
  );
}
