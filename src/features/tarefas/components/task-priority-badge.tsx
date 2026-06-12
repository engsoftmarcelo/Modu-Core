import { Badge } from "@/components/ui/badge";

import { taskPriorityLabels, type TaskPriority } from "../types";

const priorityTones: Record<TaskPriority, "slate" | "blue" | "red"> = {
  low: "slate",
  medium: "blue",
  high: "red",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge tone={priorityTones[priority]}>
      Prioridade {taskPriorityLabels[priority].toLowerCase()}
    </Badge>
  );
}
