import { Check } from "lucide-react";

import type { WorkOrderStatus } from "@/features/ordens-servico/types";
import { cn } from "@/lib/utils";

export const workOrderDemoSteps = [
  "Solicitacao",
  "Orcamento",
  "Aprovacao",
  "Execucao",
  "Fotos",
  "Conclusao",
] as const;

export type WorkOrderDemoStep = 1 | 2 | 3 | 4 | 5 | 6;

type WorkOrderDemoState = {
  attachmentCount: number;
  quotedAt: string | null;
  status: WorkOrderStatus;
};

export function resolveWorkOrderDemoProgress(state: WorkOrderDemoState): {
  completed: boolean;
  currentStep: WorkOrderDemoStep;
} {
  if (state.status === "completed") {
    return { completed: true, currentStep: 6 };
  }

  if (state.attachmentCount > 0) {
    return { completed: false, currentStep: 6 };
  }

  if (state.status === "in_progress") {
    return { completed: false, currentStep: 5 };
  }

  if (state.status === "approved") {
    return { completed: false, currentStep: 4 };
  }

  if (state.quotedAt) {
    return { completed: false, currentStep: 3 };
  }

  return { completed: false, currentStep: 2 };
}

type WorkOrderDemoProgressProps = {
  completed?: boolean;
  currentStep: WorkOrderDemoStep;
};

export function WorkOrderDemoProgress({
  completed = false,
  currentStep,
}: WorkOrderDemoProgressProps) {
  const currentLabel = completed
    ? "Fluxo concluido"
    : workOrderDemoSteps[currentStep - 1];

  return (
    <nav
      aria-label="Progresso da demo de ordens de servico"
      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5"
    >
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              {completed ? "Demo completa" : `Etapa ${currentStep} de 6`}
            </p>
            <p className="mt-1 font-bold text-ink-950">{currentLabel}</p>
          </div>
          {completed ? (
            <span className="grid size-9 place-items-center rounded-full bg-emerald-600 text-white">
              <Check className="size-5" />
            </span>
          ) : null}
        </div>
        <ol className="mt-4 grid grid-cols-6 gap-1.5">
          {workOrderDemoSteps.map((label, index) => {
            const step = (index + 1) as WorkOrderDemoStep;
            const reached = completed || step <= currentStep;

            return (
              <li key={label}>
                <span className="sr-only">{label}</span>
                <span
                  aria-current={!completed && step === currentStep ? "step" : undefined}
                  className={cn(
                    "block h-2 rounded-full",
                    reached ? "bg-emerald-500" : "bg-slate-200",
                  )}
                />
              </li>
            );
          })}
        </ol>
      </div>

      <ol className="hidden grid-cols-6 sm:grid">
        {workOrderDemoSteps.map((label, index) => {
          const step = (index + 1) as WorkOrderDemoStep;
          const stepCompleted = completed || step < currentStep;
          const active = !completed && step === currentStep;

          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="relative flex min-w-0 flex-col items-center gap-2 px-1 text-center"
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-1/2 left-[-50%] top-4 h-px",
                    stepCompleted || active ? "bg-emerald-300" : "bg-slate-200",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 grid size-8 place-items-center rounded-full border text-xs font-bold",
                  stepCompleted
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : active
                      ? "border-ink-950 bg-ink-950 text-white"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {stepCompleted ? <Check className="size-4" /> : step}
              </span>
              <span
                className={cn(
                  "relative z-10 bg-white px-1 text-xs font-bold",
                  active ? "text-ink-950" : "text-slate-500",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
