"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTaskStatusAction } from "../actions";
import {
  taskStatusLabels,
  taskStatuses,
  type TaskStatus,
} from "../types";

type TaskStatusSelectProps = {
  initialStatus: TaskStatus;
  taskId: string;
  taskTitle: string;
};

export function TaskStatusSelect({
  initialStatus,
  taskId,
  taskTitle,
}: TaskStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: TaskStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setError("");

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, nextStatus);

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
        <span className="sr-only">Status de {taskTitle}</span>
        <select
          value={status}
          onChange={(event) => handleChange(event.target.value as TaskStatus)}
          disabled={isPending}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
        >
          {taskStatuses.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>
              {taskStatusLabels[taskStatus]}
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
