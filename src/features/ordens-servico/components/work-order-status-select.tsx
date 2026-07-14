"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateWorkOrderStatusAction } from "../actions";
import {
  workOrderStatusLabels,
  workOrderStatuses,
  type WorkOrderStatus,
} from "../types";

type WorkOrderStatusSelectProps = {
  initialStatus: WorkOrderStatus;
  serviceType: string;
  workOrderId: string;
};

export function WorkOrderStatusSelect({
  initialStatus,
  serviceType,
  workOrderId,
}: WorkOrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const availableStatuses = workOrderStatuses.filter(
    (workOrderStatus) =>
      workOrderStatus !== "completed" || initialStatus === "completed",
  );

  function handleChange(nextStatus: WorkOrderStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setError("");

    startTransition(async () => {
      const result = await updateWorkOrderStatusAction(workOrderId, nextStatus);

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
        <span className="sr-only">Status de {serviceType}</span>
        <select
          value={status}
          onChange={(event) =>
            handleChange(event.target.value as WorkOrderStatus)
          }
          disabled={isPending}
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-wait disabled:opacity-60"
        >
          {availableStatuses.map((workOrderStatus) => (
            <option key={workOrderStatus} value={workOrderStatus}>
              {workOrderStatusLabels[workOrderStatus]}
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
