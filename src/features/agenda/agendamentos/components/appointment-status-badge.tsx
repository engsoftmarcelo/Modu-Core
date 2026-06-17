import { Badge } from "@/components/ui/badge";

import {
  appointmentStatusLabels,
  appointmentStatusTones,
  type AppointmentStatus,
} from "../types";

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <Badge tone={appointmentStatusTones[status]}>
      {appointmentStatusLabels[status]}
    </Badge>
  );
}
