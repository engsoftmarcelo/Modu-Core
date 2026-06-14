import type { Database } from "@/types/database";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskStatus = Task["status"];
export type TaskStatusFilter = TaskStatus | "open" | "all";
export type TaskPriority = Task["priority"];
export type TaskRelationType = "customer" | "lead";

export type TaskWithRelation = Task & {
  relatedName: string | null;
  relatedType: TaskRelationType | null;
};

export type TaskRelationOption = {
  id: string;
  label: string;
};

export type TaskRelationOptions = {
  customers: TaskRelationOption[];
  leads: TaskRelationOption[];
};

export type TaskFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialTaskFormState: TaskFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const taskStatuses: TaskStatus[] = [
  "pending",
  "in_progress",
  "done",
  "cancelled",
];

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluida",
  cancelled: "Cancelada",
};

export const taskPriorities: TaskPriority[] = ["low", "medium", "high"];

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
};
