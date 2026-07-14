import type { Metadata } from "next";
import { ListChecks, Plus } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        eyebrow="Rotina e follow-up"
        icon={ListChecks}
        tone="amber"
        title="Tarefas"
        description="Organize retornos, pendencias e proximos passos com prazo claro."
        actions={[{ href: "/tarefas/novo", icon: Plus, label: "Nova tarefa" }]}
      />

      {params.deleted === "1" ? (
        <Notice tone="success">Tarefa excluida com sucesso.</Notice>
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
