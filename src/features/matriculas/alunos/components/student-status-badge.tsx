import { Badge } from "@/components/ui/badge";

import { studentStatusLabels, type StudentStatus } from "../types";

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge tone={status === "active" ? "green" : "slate"}>
      {studentStatusLabels[status]}
    </Badge>
  );
}
