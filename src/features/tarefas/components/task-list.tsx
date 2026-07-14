import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Eye,
  Link2,
  ListChecks,
  Pencil,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

import type { TaskWithRelation } from "../types";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusSelect } from "./task-status-select";

function relatedHref(task: TaskWithRelation) {
  if (task.relatedType === "customer" && task.customer_id) {
    return `/crm/${task.customer_id}`;
  }
  if (task.relatedType === "lead" && task.lead_id) {
    return `/crm/leads/${task.lead_id}`;
  }
  return null;
}

function isOverdue(task: TaskWithRelation) {
  return (
    Boolean(task.due_at) &&
    new Date(task.due_at as string) < new Date() &&
    (task.status === "pending" || task.status === "in_progress")
  );
}

export function TaskList({
  count,
  hasFilters = false,
  tasks,
}: {
  count: number;
  hasFilters?: boolean;
  tasks: TaskWithRelation[];
}) {
  if (!tasks.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={ListChecks}
        tone="amber"
        emptyTitle="Nenhuma tarefa por aqui ainda."
        emptyDescription="Crie a primeira tarefa para organizar retornos, pendencias e proximos passos da equipe."
        filteredTitle="Nenhuma tarefa corresponde aos filtros."
        filteredDescription="Altere a busca, o status ou a prioridade para encontrar outras tarefas."
        createHref="/tarefas/novo"
        createLabel="Criar primeira tarefa"
        clearHref="/tarefas"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <p className="font-bold text-ink-950">
          {count} {count === 1 ? "tarefa" : "tarefas"}
        </p>
        {count > 100 ? (
          <p className="mt-1 text-xs text-slate-500">
            Exibindo os primeiros 100 resultados.
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <th className="px-6 py-4">Tarefa</th>
              <th className="px-5 py-4">Relacionado</th>
              <th className="px-5 py-4">Data</th>
              <th className="px-5 py-4">Prioridade</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const href = relatedHref(task);
              const overdue = isOverdue(task);

              return (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-amber-50/30"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/tarefas/${task.id}`}
                      className="font-bold text-ink-950 hover:text-amber-700"
                    >
                      {task.title}
                    </Link>
                    <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
                      {task.description || "Sem descricao"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {href && task.relatedName ? (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700"
                      >
                        {task.relatedType === "customer" ? (
                          <UserRound className="size-4 text-brand-600" />
                        ) : (
                          <Link2 className="size-4 text-violet-600" />
                        )}
                        {task.relatedName}
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">Sem vinculo</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarClock className="size-4 text-slate-500" />
                      {task.due_at ? formatDateTime(task.due_at) : "Sem data"}
                    </p>
                    {overdue ? (
                      <Badge tone="red" className="mt-2">
                        <AlertTriangle className="mr-1 size-3" />
                        Atrasada
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <TaskStatusSelect
                      taskId={task.id}
                      taskTitle={task.title}
                      initialStatus={task.status}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/tarefas/${task.id}`}
                        aria-label={`Ver ${task.title}`}
                        className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-amber-700"
                      >
                        <Eye className="size-[18px]" />
                      </Link>
                      <Link
                        href={`/tarefas/${task.id}/editar`}
                        aria-label={`Editar ${task.title}`}
                        className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-amber-700"
                      >
                        <Pencil className="size-[18px]" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {tasks.map((task) => {
          const overdue = isOverdue(task);

          return (
            <Link
              key={task.id}
              href={`/tarefas/${task.id}`}
              className="flex gap-3 p-5 transition hover:bg-amber-50/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <ListChecks className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-950">{task.title}</p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {task.relatedName || "Sem cliente ou lead relacionado"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TaskPriorityBadge priority={task.priority} />
                  {overdue ? (
                    <Badge tone="red">Atrasada</Badge>
                  ) : (
                    <Badge tone="slate">
                      {task.due_at ? formatDateTime(task.due_at) : "Sem data"}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
