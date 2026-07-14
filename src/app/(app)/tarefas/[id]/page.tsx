import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Link2,
  ListChecks,
  Pencil,
  StickyNote,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { DeleteTaskButton } from "@/features/tarefas/components/delete-task-button";
import { TaskPriorityBadge } from "@/features/tarefas/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tarefas/components/task-status-badge";
import { TaskStatusSelect } from "@/features/tarefas/components/task-status-select";
import { getTaskById } from "@/features/tarefas/queries";
import { formatDateTime } from "@/lib/utils";

type TaskDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: TaskDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  return { title: task?.title ?? "Tarefa" };
}

export default async function TaskDetailsPage({
  params,
  searchParams,
}: TaskDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const relatedHref =
    task.relatedType === "customer" && task.customer_id
      ? `/crm/${task.customer_id}`
      : task.relatedType === "lead" && task.lead_id
        ? `/crm/leads/${task.lead_id}`
        : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/tarefas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-amber-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para tarefas
      </Link>

      {notice.created === "1" || notice.updated === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {notice.created === "1"
            ? "Tarefa criada com sucesso."
            : "Tarefa atualizada com sucesso."}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <ListChecks className="size-7" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-ink-950 sm:text-4xl">
                {task.title}
              </h1>
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
            <p className="mt-2 text-slate-500">
              {task.due_at
                ? `Prazo: ${formatDateTime(task.due_at)}`
                : "Sem prazo definido"}
            </p>
          </div>
        </div>

        <Link
          href={`/tarefas/${task.id}/editar`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Pencil className="size-4" />
          Editar tarefa
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <StickyNote className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Descricao</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {task.description || "Nenhuma descricao registrada."}
            </p>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Contexto</h2>
            </div>
            {relatedHref && task.relatedName ? (
              <Link
                href={relatedHref}
                className="flex items-center gap-3 p-5 transition hover:bg-amber-50/40 sm:p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  {task.relatedType === "customer" ? (
                    <UserRound className="size-5" />
                  ) : (
                    <Link2 className="size-5" />
                  )}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {task.relatedType === "customer" ? "Cliente" : "Lead"}
                  </p>
                  <p className="mt-1 font-bold text-ink-950">
                    {task.relatedName}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="p-5 text-sm text-slate-500 sm:p-6">
                Nenhum cliente ou lead relacionado.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Andamento</h2>
            <div className="mt-5">
              <TaskStatusSelect
                taskId={task.id}
                taskTitle={task.title}
                initialStatus={task.status}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Registro</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-amber-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Data da tarefa
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {task.due_at ? formatDateTime(task.due_at) : "Nao definida"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-slate-500" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Criada em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(task.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A exclusao remove esta tarefa definitivamente.
            </p>
            <div className="mt-5">
              <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
