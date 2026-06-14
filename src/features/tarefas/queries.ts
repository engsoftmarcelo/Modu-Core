import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  taskPriorities,
  taskStatuses,
  type Task,
  type TaskPriority,
  type TaskRelationOptions,
  type TaskStatus,
  type TaskStatusFilter,
  type TaskWithRelation,
} from "./types";

export type TaskListFilters = {
  priority?: TaskPriority | "all";
  query?: string;
  status?: TaskStatusFilter;
};

export type TaskStats = {
  open: number;
  dueToday: number;
  overdue: number;
  done: number;
};

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

function saoPauloDateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(value);
}

async function attachRelations(
  tasks: Task[],
  organizationId: string,
): Promise<TaskWithRelation[]> {
  const customerIds = [
    ...new Set(tasks.flatMap((task) => (task.customer_id ? [task.customer_id] : []))),
  ];
  const leadIds = [
    ...new Set(tasks.flatMap((task) => (task.lead_id ? [task.lead_id] : []))),
  ];
  const supabase = await createClient();

  const [customersResult, leadsResult] = await Promise.all([
    customerIds.length
      ? supabase
          .from("customers")
          .select("id, name")
          .eq("organization_id", organizationId)
          .in("id", customerIds)
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? supabase
          .from("leads")
          .select("id, name")
          .eq("organization_id", organizationId)
          .in("id", leadIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (customersResult.error || leadsResult.error) {
    throw new Error("Nao foi possivel carregar os vinculos das tarefas.");
  }

  const customerNames = new Map(
    (customersResult.data ?? []).map((customer) => [customer.id, customer.name]),
  );
  const leadNames = new Map(
    (leadsResult.data ?? []).map((lead) => [lead.id, lead.name]),
  );

  return tasks.map((task) => ({
    ...task,
    relatedName: task.customer_id
      ? customerNames.get(task.customer_id) ?? null
      : task.lead_id
        ? leadNames.get(task.lead_id) ?? null
        : null,
    relatedType: task.customer_id ? "customer" : task.lead_id ? "lead" : null,
  }));
}

export async function getTasks(filters: TaskListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { tasks: [] as TaskWithRelation[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select(
      "id, organization_id, assignee_id, customer_id, lead_id, title, description, status, priority, due_at, created_at, updated_at",
      { count: "exact" },
    )
    .eq("organization_id", identity.organizationId)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.status === "open") {
    query = query.in("status", ["pending", "in_progress"]);
  } else if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar as tarefas: ${error.message}`);
  }

  return {
    tasks: await attachRelations(data ?? [], identity.organizationId),
    count: count ?? 0,
  };
}

export async function getTaskStats(): Promise<TaskStats> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { open: 0, dueToday: 0, overdue: 0, done: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("status, due_at")
    .eq("organization_id", identity.organizationId);

  if (error) {
    throw new Error(`Nao foi possivel carregar os indicadores: ${error.message}`);
  }

  const now = new Date();
  const today = saoPauloDateKey(now);

  return (data ?? []).reduce<TaskStats>(
    (stats, task) => {
      const isOpen = task.status === "pending" || task.status === "in_progress";
      const dueAt = task.due_at ? new Date(task.due_at) : null;

      if (isOpen) stats.open += 1;
      if (task.status === "done") stats.done += 1;
      if (isOpen && dueAt && saoPauloDateKey(dueAt) === today) {
        stats.dueToday += 1;
      }
      if (isOpen && dueAt && dueAt < now) {
        stats.overdue += 1;
      }

      return stats;
    },
    { open: 0, dueToday: 0, overdue: 0, done: 0 },
  );
}

export async function getTaskRelationOptions(): Promise<TaskRelationOptions> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { customers: [], leads: [] };
  }

  const supabase = await createClient();
  const [customersResult, leadsResult] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, company")
      .eq("organization_id", identity.organizationId)
      .order("name")
      .limit(200),
    supabase
      .from("leads")
      .select("id, name, company")
      .eq("organization_id", identity.organizationId)
      .order("name")
      .limit(200),
  ]);

  if (customersResult.error || leadsResult.error) {
    throw new Error("Nao foi possivel carregar clientes e leads.");
  }

  return {
    customers: (customersResult.data ?? []).map((customer) => ({
      id: customer.id,
      label: customer.company
        ? `${customer.name} - ${customer.company}`
        : customer.name,
    })),
    leads: (leadsResult.data ?? []).map((lead) => ({
      id: lead.id,
      label: lead.company ? `${lead.name} - ${lead.company}` : lead.name,
    })),
  };
}

export const getTaskById = cache(async function getTaskById(taskId: string) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, organization_id, assignee_id, customer_id, lead_id, title, description, status, priority, due_at, created_at, updated_at",
    )
    .eq("id", taskId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar a tarefa: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [task] = await attachRelations([data], identity.organizationId);
  return task;
});

export function isTaskStatus(value: string | undefined): value is TaskStatus {
  return taskStatuses.includes(value as TaskStatus);
}

export function isTaskStatusFilter(
  value: string | undefined,
): value is TaskStatusFilter {
  return value === "all" || value === "open" || isTaskStatus(value);
}

export function isTaskPriority(
  value: string | undefined,
): value is TaskPriority {
  return taskPriorities.includes(value as TaskPriority);
}
