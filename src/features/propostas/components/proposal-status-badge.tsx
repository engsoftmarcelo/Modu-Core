import { Badge } from "@/components/ui/badge";

import {
  proposalStatusLabels,
  proposalStatusTones,
  type ProposalStatus,
} from "../types";

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <Badge tone={proposalStatusTones[status]}>
      {proposalStatusLabels[status]}
    </Badge>
  );
}
