import { Badge } from "@/components/ui/badge";

import {
  customerStatusLabels,
  type CustomerStatus,
} from "../types";

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <Badge tone={status === "active" ? "green" : "slate"}>
      <span
        className={
          status === "active"
            ? "mr-1.5 size-1.5 rounded-full bg-emerald-500"
            : "mr-1.5 size-1.5 rounded-full bg-slate-400"
        }
      />
      {customerStatusLabels[status]}
    </Badge>
  );
}
