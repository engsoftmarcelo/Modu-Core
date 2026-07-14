"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FeedbackMessage } from "@/components/ui/feedback-message";

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

type ActionFeedback = {
  message: string;
  tone: "error" | "success";
} | null;

export function TaskStatusSelect({
  initialStatus,
  taskId,
  taskTitle,
}: TaskStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: TaskStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setFeedback(null);

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, nextStatus);

      if (result.error) {
        setStatus(previousStatus);
        setFeedback({ message: result.error, tone: "error" });
        return;
      }

      setFeedback({
        message: "Tarefa atualizada com sucesso.",
        tone: "success",
      });
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
          aria-busy={isPending}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
        >
          {taskStatuses.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>
              {taskStatusLabels[taskStatus]}
            </option>
          ))}
        </select>
      </label>
      <div className="min-h-6 pt-2">
        {isPending ? (
          <FeedbackMessage tone="loading" variant="inline">
            Salvando...
          </FeedbackMessage>
        ) : feedback ? (
          <FeedbackMessage tone={feedback.tone} variant="inline">
            {feedback.message}
          </FeedbackMessage>
        ) : null}
      </div>
    </div>
  );
}
