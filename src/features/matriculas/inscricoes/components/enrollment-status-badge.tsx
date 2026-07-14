import { Badge } from "@/components/ui/badge";

import {
  enrollmentPaymentStatusLabels,
  enrollmentStatusLabels,
  type EnrollmentPaymentStatus,
  type EnrollmentStatus,
} from "../types";

const tones: Record<EnrollmentStatus, "amber" | "blue" | "green" | "red" | "slate" | "violet"> = {
  interested: "amber",
  enrolled: "blue",
  in_progress: "violet",
  completed: "slate",
  cancelled: "red",
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge tone={tones[status]}>{enrollmentStatusLabels[status]}</Badge>;
}

const paymentTones: Record<
  EnrollmentPaymentStatus,
  "amber" | "green" | "slate" | "violet"
> = {
  pending: "amber",
  paid: "green",
  refunded: "violet",
  waived: "slate",
};

export function EnrollmentPaymentStatusBadge({
  status,
}: {
  status: EnrollmentPaymentStatus;
}) {
  return (
    <Badge tone={paymentTones[status]}>
      {enrollmentPaymentStatusLabels[status]}
    </Badge>
  );
}
