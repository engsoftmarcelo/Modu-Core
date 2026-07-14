import { Badge } from "@/components/ui/badge";

import {
  enrollmentStatusLabels,
  type EnrollmentStatus,
} from "../types";

const tones: Record<EnrollmentStatus, "amber" | "blue" | "green" | "red" | "slate" | "violet"> = {
  interested: "amber",
  enrolled: "blue",
  paid: "green",
  in_progress: "violet",
  completed: "slate",
  cancelled: "red",
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge tone={tones[status]}>{enrollmentStatusLabels[status]}</Badge>;
}
