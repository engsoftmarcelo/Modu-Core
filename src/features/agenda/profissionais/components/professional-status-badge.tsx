import { Badge } from "@/components/ui/badge";

import { professionalStatusLabels } from "../types";

export function ProfessionalStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "green" : "slate"}>
      <span
        className={
          active
            ? "mr-1.5 size-1.5 rounded-full bg-emerald-500"
            : "mr-1.5 size-1.5 rounded-full bg-slate-400"
        }
      />
      {professionalStatusLabels[active ? "active" : "inactive"]}
    </Badge>
  );
}
