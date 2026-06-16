import { Badge } from "@/components/ui/badge";

import { serviceStatusLabels } from "../types";

export function ServiceStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "green" : "slate"}>
      <span
        className={
          active
            ? "mr-1.5 size-1.5 rounded-full bg-emerald-500"
            : "mr-1.5 size-1.5 rounded-full bg-slate-400"
        }
      />
      {serviceStatusLabels[active ? "active" : "inactive"]}
    </Badge>
  );
}
