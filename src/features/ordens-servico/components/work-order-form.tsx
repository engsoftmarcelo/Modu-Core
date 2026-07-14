"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { workOrderDemoDefaults } from "@/features/ordens-servico/demo/defaults";
import { cn } from "@/lib/utils";

import { createWorkOrderAction, updateWorkOrderAction } from "../actions";
import {
  initialWorkOrderFormState,
  workOrderStatusLabels,
  workOrderStatuses,
  type WorkOrder,
  type WorkOrderCustomerOption,
  type WorkOrderFormState,
} from "../types";

type WorkOrderFormProps = {
  customers: WorkOrderCustomerOption[];
  defaultCustomerId?: string;
  defaultVisitDate?: string;
  demoMode?: boolean;
  mode: "create" | "edit";
  workOrder?: WorkOrder;
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

function SubmitButton({
  demoMode,
  mode,
}: {
  demoMode: boolean;
  mode: WorkOrderFormProps["mode"];
}) {
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
          ? demoMode
            ? "Registrar solicitacao"
            : "Criar ordem"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function WorkOrderForm({
  customers,
  defaultCustomerId = "",
  defaultVisitDate = "",
  demoMode = false,
  mode,
  workOrder,
}: WorkOrderFormProps) {
  const availableStatuses = workOrderStatuses.filter(
    (status) => status !== "completed" || workOrder?.status === "completed",
  );
  const action =
    mode === "edit" && workOrder
      ? updateWorkOrderAction.bind(null, workOrder.id)
      : createWorkOrderAction;
  const [state, formAction] = useActionState<WorkOrderFormState, FormData>(
    action,
    initialWorkOrderFormState,
  );
  const demoDefaults = demoMode && !workOrder ? workOrderDemoDefaults : undefined;
  const cancelHref = workOrder
    ? `/ordens-servico/${workOrder.id}`
    : demoMode
      ? "/ordens-servico/demo"
      : "/ordens-servico";

  return (
    <form action={formAction} noValidate className="space-y-7">
      {demoMode ? <input type="hidden" name="demo" value="1" /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Cliente"
            name="customerId"
            required
            error={state.errors.customerId}
          >
            <select
              id="customerId"
              name="customerId"
              defaultValue={workOrder?.customer_id ?? defaultCustomerId}
              className={cn(
                controlClassName,
                state.errors.customerId && "border-red-300",
              )}
              required
            >
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Endereco"
            name="address"
            required
            error={state.errors.address}
          >
            <input
              id="address"
              name="address"
              defaultValue={workOrder?.address ?? demoDefaults?.address}
              maxLength={500}
              autoComplete="street-address"
              placeholder="Rua, numero, complemento, bairro e cidade"
              className={cn(
                controlClassName,
                state.errors.address && "border-red-300",
              )}
              required
            />
          </Field>
        </div>

        <Field
          label="Tipo de servico"
          name="serviceType"
          required
          error={state.errors.serviceType}
        >
          <input
            id="serviceType"
            name="serviceType"
            defaultValue={workOrder?.service_type ?? demoDefaults?.serviceType}
            maxLength={160}
            placeholder="Ex.: Manutencao de ar-condicionado"
            className={cn(
              controlClassName,
              state.errors.serviceType && "border-red-300",
            )}
            required
          />
        </Field>

        <Field
          label="Tecnico responsavel"
          name="technicianName"
          required
          error={state.errors.technicianName}
        >
          <input
            id="technicianName"
            name="technicianName"
            defaultValue={
              workOrder?.technician_name ?? demoDefaults?.technicianName
            }
            maxLength={160}
            placeholder="Nome do tecnico"
            className={cn(
              controlClassName,
              state.errors.technicianName && "border-red-300",
            )}
            required
          />
        </Field>

        <Field
          label="Data da visita"
          name="visitDate"
          required
          error={state.errors.visitDate}
        >
          <input
            id="visitDate"
            name="visitDate"
            type="date"
            defaultValue={workOrder?.visit_date ?? defaultVisitDate}
            className={cn(
              controlClassName,
              state.errors.visitDate && "border-red-300",
            )}
            required
          />
        </Field>

        <Field label="Status" name="status" required error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={workOrder?.status ?? demoDefaults?.status ?? "requested"}
            className={cn(
              controlClassName,
              state.errors.status && "border-red-300",
            )}
            required
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {workOrderStatusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Descricao"
        name="description"
        required
        error={state.errors.description}
      >
        <textarea
          id="description"
          name="description"
          defaultValue={workOrder?.description ?? demoDefaults?.description}
          maxLength={3000}
          rows={7}
          placeholder="Descreva o problema, o servico solicitado e os detalhes importantes para a visita."
          className={cn(
            controlClassName,
            "resize-y py-3",
            state.errors.description && "border-red-300",
          )}
          required
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
        <SubmitButton demoMode={demoMode} mode={mode} />
      </div>
    </form>
  );
}
