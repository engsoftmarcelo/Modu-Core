import { Badge } from "@/components/ui/badge";

import {
  workOrderStatusLabels,
  workOrderStatusTones,
  type WorkOrderStatus,
} from "../types";

export function WorkOrderStatusBadge({
  status,
}: {
  status: WorkOrderStatus;
}) {
  return (
    <Badge tone={workOrderStatusTones[status]}>
      {workOrderStatusLabels[status]}
    </Badge>
  );
}
