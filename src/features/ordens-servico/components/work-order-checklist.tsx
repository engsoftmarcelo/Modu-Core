"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ListChecks,
  LoaderCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { updateWorkOrderChecklistItemAction } from "../actions";
import type {
  WorkOrderChecklistItem,
  WorkOrderChecklistItemKey,
} from "../types";

type WorkOrderChecklistProps = {
  initialItems: WorkOrderChecklistItem[];
  workOrderId: string;
};

export function WorkOrderChecklist({
  initialItems,
  workOrderId,
}: WorkOrderChecklistProps) {
  const [items, setItems] = useState(initialItems);
  const [pendingKeys, setPendingKeys] = useState<
    Set<WorkOrderChecklistItemKey>
  >(() => new Set());
  const [errorMessage, setErrorMessage] = useState("");

  const completedCount = useMemo(
    () => items.filter((item) => item.completed).length,
    [items],
  );
  const progress = items.length
    ? Math.round((completedCount / items.length) * 100)
    : 0;
  const isComplete = items.length > 0 && completedCount === items.length;

  async function toggleItem(item: WorkOrderChecklistItem) {
    if (pendingKeys.has(item.item_key)) {
      return;
    }

    const nextCompleted = !item.completed;
    const optimisticCompletedAt = nextCompleted
      ? new Date().toISOString()
      : null;

    setErrorMessage("");
    setPendingKeys((current) => new Set(current).add(item.item_key));
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.item_key === item.item_key
          ? {
              ...currentItem,
              completed: nextCompleted,
              completed_at: optimisticCompletedAt,
            }
          : currentItem,
      ),
    );

    const result = await updateWorkOrderChecklistItemAction(
      workOrderId,
      item.item_key,
      nextCompleted,
    );

    if (result.error) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.item_key === item.item_key
            ? {
                ...currentItem,
                completed: item.completed,
                completed_at: item.completed_at,
              }
            : currentItem,
        ),
      );
      setErrorMessage(result.error);
    } else {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.item_key === item.item_key
            ? {
                ...currentItem,
                completed: nextCompleted,
                completed_at: result.completedAt ?? null,
              }
            : currentItem,
        ),
      );
    }

    setPendingKeys((current) => {
      const next = new Set(current);
      next.delete(item.item_key);
      return next;
    });
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <ListChecks className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-ink-950">Checklist da visita</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                {completedCount} de {items.length} etapas concluidas
              </p>
            </div>
          </div>
          {isComplete ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              Concluido
            </span>
          ) : (
            <span className="shrink-0 text-sm font-bold tabular-nums text-violet-700">
              {progress}%
            </span>
          )}
        </div>

        <div
          role="progressbar"
          aria-label="Progresso do checklist"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-violet-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {items.length ? (
        <div className="divide-y divide-slate-100 px-5 sm:px-6">
          {items.map((item) => {
            const pending = pendingKeys.has(item.item_key);

            return (
              <label
                key={item.id}
                className={cn(
                  "flex min-h-16 cursor-pointer items-center gap-3 py-3 transition",
                  pending && "cursor-wait",
                )}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={pending}
                  onChange={() => void toggleItem(item)}
                  className="size-5 shrink-0 cursor-pointer accent-emerald-600 disabled:cursor-wait"
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm font-semibold text-ink-950",
                    item.completed && "text-slate-400 line-through",
                  )}
                >
                  {item.label}
                </span>
                <span className="grid size-5 shrink-0 place-items-center">
                  {pending ? (
                    <LoaderCircle className="size-4 animate-spin text-violet-600" />
                  ) : item.completed ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-36 place-items-center px-5 py-7 text-center sm:px-6">
          <div className="max-w-sm">
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <ListChecks className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-bold text-ink-950">
              Checklist sem etapas.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Esta ordem ainda nao possui etapas para acompanhar.
            </p>
          </div>
        </div>
      )}

      {errorMessage ? (
        <div
          role="alert"
          className="mx-5 mb-5 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-6"
        >
          <CircleAlert className="size-5 shrink-0" />
          {errorMessage}
        </div>
      ) : null}
    </Card>
  );
}
