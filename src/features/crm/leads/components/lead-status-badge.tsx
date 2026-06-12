import { Badge } from "@/components/ui/badge";

import {
  leadStatusLabels,
  leadStatusTones,
  type LeadStatus,
} from "../types";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge tone={leadStatusTones[status]}>
      {leadStatusLabels[status]}
    </Badge>
  );
}
