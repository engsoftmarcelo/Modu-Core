"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateAppointmentStatusAction } from "../actions";
import {
  appointmentStatusLabels,
  appointmentStatuses,
  type AppointmentStatus,
} from "../types";

type AppointmentStatusSelectProps = {
  appointmentId: string;
  appointmentTitle: string;
  initialStatus: AppointmentStatus;
};

export function AppointmentStatusSelect({
  appointmentId,
  appointmentTitle,
  initialStatus,
}: AppointmentStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: AppointmentStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setError("");

    startTransition(async () => {
      const result = await updateAppointmentStatusAction(
        appointmentId,
        nextStatus,
      );

      if (result.error) {
        setStatus(previousStatus);
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <label>
        <span className="sr-only">Status de {appointmentTitle}</span>
        <select
          value={status}
          onChange={(event) =>
            handleChange(event.target.value as AppointmentStatus)
          }
          disabled={isPending}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
        >
          {appointmentStatuses.map((appointmentStatus) => (
            <option key={appointmentStatus} value={appointmentStatus}>
              {appointmentStatusLabels[appointmentStatus]}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
