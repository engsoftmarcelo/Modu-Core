"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { createAppointmentAction, updateAppointmentAction } from "../actions";
import {
  appointmentStatusLabels,
  appointmentStatuses,
  initialAppointmentFormState,
  type AppointmentFormState,
  type AppointmentOptions,
  type AppointmentWithRelations,
} from "../types";

export type AppointmentFormDefaults = {
  date: string;
  startTime: string;
  durationMinutes: number;
  customerId: string;
  professionalId: string;
  serviceId: string;
  title: string;
};

type AppointmentFormProps = {
  mode: "create" | "edit";
  options: AppointmentOptions;
  defaults: AppointmentFormDefaults;
  appointment?: AppointmentWithRelations;
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

function SubmitButton({ mode }: { mode: AppointmentFormProps["mode"] }) {
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
          ? "Criar agendamento"
          : "Salvar alteracoes"}
    </Button>
  );
}

export function AppointmentForm({
  mode,
  options,
  defaults,
  appointment,
}: AppointmentFormProps) {
  const action =
    mode === "edit" && appointment
      ? updateAppointmentAction.bind(null, appointment.id)
      : createAppointmentAction;
  const [state, formAction] = useActionState<AppointmentFormState, FormData>(
    action,
    initialAppointmentFormState,
  );
  const [duration, setDuration] = useState(String(defaults.durationMinutes));
  const cancelHref = appointment
    ? `/agenda/agendamentos/${appointment.id}`
    : "/agenda";

  function handleServiceChange(serviceId: string) {
    const service = options.services.find((item) => item.id === serviceId);
    if (service?.durationMinutes) {
      setDuration(String(service.durationMinutes));
    }
  }

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Titulo" name="title" required error={state.errors.title}>
            <input
              id="title"
              name="title"
              defaultValue={appointment?.title ?? defaults.title}
              maxLength={180}
              placeholder="Ex.: Corte e escova - Maria"
              className={cn(
                controlClassName,
                state.errors.title && "border-red-300",
              )}
              required
            />
          </Field>
        </div>

        <Field label="Cliente" name="customerId" error={state.errors.customerId}>
          <select
            id="customerId"
            name="customerId"
            defaultValue={appointment?.customer_id ?? defaults.customerId}
            className={cn(
              controlClassName,
              state.errors.customerId && "border-red-300",
            )}
          >
            <option value="">Sem cliente</option>
            {options.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Profissional"
          name="professionalId"
          error={state.errors.professionalId}
        >
          <select
            id="professionalId"
            name="professionalId"
            defaultValue={appointment?.professional_id ?? defaults.professionalId}
            className={cn(
              controlClassName,
              state.errors.professionalId && "border-red-300",
            )}
          >
            <option value="">Sem profissional</option>
            {options.professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Servico" name="serviceId" error={state.errors.serviceId}>
          <select
            id="serviceId"
            name="serviceId"
            defaultValue={appointment?.service_id ?? defaults.serviceId}
            onChange={(event) => handleServiceChange(event.target.value)}
            className={cn(
              controlClassName,
              state.errors.serviceId && "border-red-300",
            )}
          >
            <option value="">Sem servico</option>
            {options.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Local" name="location" error={state.errors.location}>
          <input
            id="location"
            name="location"
            defaultValue={appointment?.location ?? ""}
            maxLength={160}
            placeholder="Ex.: Sala 2, Unidade Centro"
            className={cn(
              controlClassName,
              state.errors.location && "border-red-300",
            )}
          />
        </Field>

        <Field label="Data" name="date" required error={state.errors.date}>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={defaults.date}
            className={cn(controlClassName, state.errors.date && "border-red-300")}
            required
          />
        </Field>

        <Field
          label="Horario de inicio"
          name="startTime"
          required
          error={state.errors.startTime}
        >
          <input
            id="startTime"
            name="startTime"
            type="time"
            step="300"
            defaultValue={defaults.startTime}
            className={cn(
              controlClassName,
              state.errors.startTime && "border-red-300",
            )}
            required
          />
        </Field>

        <Field
          label="Duracao (minutos)"
          name="durationMinutes"
          required
          error={state.errors.durationMinutes}
        >
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            inputMode="numeric"
            min="5"
            max="1440"
            step="5"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className={cn(
              controlClassName,
              state.errors.durationMinutes && "border-red-300",
            )}
            required
          />
        </Field>

        <Field label="Status" name="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={appointment?.status ?? "scheduled"}
            className={cn(
              controlClassName,
              state.errors.status && "border-red-300",
            )}
          >
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>
                {appointmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Observacoes" name="notes" error={state.errors.notes}>
        <textarea
          id="notes"
          name="notes"
          defaultValue={appointment?.notes ?? ""}
          maxLength={2000}
          rows={4}
          placeholder="Preferencias do cliente, combinados e lembretes..."
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
