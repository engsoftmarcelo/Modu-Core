"use client";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { createTaskAction, updateTaskAction } from "../actions";
import {
  initialTaskFormState,
  taskPriorities,
  taskPriorityLabels,
  taskStatuses,
  taskStatusLabels,
  type Task,
  type TaskFormState,
  type TaskRelationOptions,
} from "../types";

type TaskFormProps = {
  initialRelationship?: string;
  initialTitle?: string;
  mode: "create" | "edit";
  options: TaskRelationOptions;
  task?: Task;
};

type FieldProps = {
  children: React.ReactNode;
  error?: string[];
  label: string;
  name: string;
  required?: boolean;
};

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

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

function SubmitButton({ mode }: { mode: TaskFormProps["mode"] }) {
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
          ? "Criar tarefa"
          : "Salvar alteracoes"}
    </Button>
  );
}

function formatDateTimeInput(value: string | null | undefined) {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function taskRelationship(task: Task | undefined) {
  if (task?.customer_id) return `customer:${task.customer_id}`;
  if (task?.lead_id) return `lead:${task.lead_id}`;
  return "";
}

export function TaskForm({
  initialRelationship = "",
  initialTitle = "",
  mode,
  options,
  task,
}: TaskFormProps) {
  const action =
    mode === "edit" && task
      ? updateTaskAction.bind(null, task.id)
      : createTaskAction;
  const [state, formAction] = useActionState<TaskFormState, FormData>(
    action,
    initialTaskFormState,
  );
  const cancelHref = task ? `/tarefas/${task.id}` : "/tarefas";
  const relationship = taskRelationship(task) || initialRelationship;

  return (
    <form action={formAction} noValidate className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Titulo" name="title" required error={state.errors.title}>
            <input
              id="title"
              name="title"
              defaultValue={task?.title ?? initialTitle}
              maxLength={180}
              placeholder="Ex.: Retornar proposta para a cliente"
              className={cn(
                controlClassName,
                state.errors.title && "border-red-300",
              )}
              required
            />
          </Field>
        </div>

        <Field
          label="Cliente ou lead relacionado"
          name="relationship"
          error={state.errors.relationship}
        >
          <select
            id="relationship"
            name="relationship"
            defaultValue={relationship}
            className={cn(
              controlClassName,
              state.errors.relationship && "border-red-300",
            )}
          >
            <option value="">Sem relacionamento</option>
            {options.customers.length ? (
              <optgroup label="Clientes">
                {options.customers.map((customer) => (
                  <option key={customer.id} value={`customer:${customer.id}`}>
                    {customer.label}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {options.leads.length ? (
              <optgroup label="Leads">
                {options.leads.map((lead) => (
                  <option key={lead.id} value={`lead:${lead.id}`}>
                    {lead.label}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </Field>

        <Field label="Data" name="dueAt" required error={state.errors.dueAt}>
          <input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            step="300"
            defaultValue={formatDateTimeInput(task?.due_at)}
            className={cn(
              controlClassName,
              state.errors.dueAt && "border-red-300",
            )}
            required
          />
        </Field>

        <Field
          label="Prioridade"
          name="priority"
          error={state.errors.priority}
        >
          <select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? "medium"}
            className={cn(
              controlClassName,
              state.errors.priority && "border-red-300",
            )}
          >
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" name="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={task?.status ?? "pending"}
            className={cn(
              controlClassName,
              state.errors.status && "border-red-300",
            )}
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
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
          defaultValue={task?.description ?? ""}
          maxLength={2000}
          rows={6}
          placeholder="Contexto do contato, combinados e resultado esperado..."
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
