import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ListChecks, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/features/tarefas/components/task-list";
import { TaskSearch } from "@/features/tarefas/components/task-search";
import { TaskSummary } from "@/features/tarefas/components/task-summary";
import {
  getTasks,
  getTaskStats,
  isTaskPriority,
  isTaskStatusFilter,
} from "@/features/tarefas/queries";
import type {
  TaskPriority,
  TaskStatusFilter,
} from "@/features/tarefas/types";

export const metadata: Metadata = { title: "Tarefas" };

type TasksPageProps = {
  searchParams: Promise<{
    deleted?: string;
    priority?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const status: TaskStatusFilter = isTaskStatusFilter(params.status)
    ? params.status
    : "all";
  const priority: TaskPriority | "all" = isTaskPriority(params.priority)
    ? params.priority
    : "all";
  const [{ tasks, count }, stats] = await Promise.all([
    getTasks({ priority, query, status }),
    getTaskStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="amber">
            <ListChecks className="mr-1.5 size-3.5" />
            Rotina e follow-up
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Tarefas
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Organize retornos, pendencias e proximos passos com prazo claro.
          </p>
        </div>

        <Link
          href="/tarefas/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Nova tarefa
        </Link>
      </div>

      {params.deleted === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Tarefa excluida com sucesso.
        </div>
      ) : null}

      <TaskSummary stats={stats} />
      <TaskSearch query={query} status={status} priority={priority} />
      <TaskList
        tasks={tasks}
        count={count}
        hasFilters={
          Boolean(query) || status !== "all" || priority !== "all"
        }
      />
    </div>
  );
}
