import { Badge } from "@/components/ui/badge";

import { taskStatusLabels, type TaskStatus } from "../types";

const statusTones: Record<
  TaskStatus,
  "amber" | "blue" | "green" | "slate"
> = {
  pending: "amber",
  in_progress: "blue",
  done: "green",
  cancelled: "slate",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={statusTones[status]}>{taskStatusLabels[status]}</Badge>;
}
