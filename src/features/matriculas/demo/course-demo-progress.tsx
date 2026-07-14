import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = [
  "Curso",
  "Turma",
  "Matricula",
  "Frequencia",
  "Certificado",
] as const;

type CourseDemoProgressProps = {
  currentStep: 1 | 2 | 3 | 4 | 5;
};

export function CourseDemoProgress({
  currentStep,
}: CourseDemoProgressProps) {
  return (
    <nav
      aria-label="Progresso da demo de cursos"
      className="overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
    >
      <ol className="grid min-w-[620px] grid-cols-5">
        {steps.map((label, index) => {
          const step = (index + 1) as CourseDemoProgressProps["currentStep"];
          const completed = step < currentStep;
          const active = step === currentStep;

          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="relative flex min-w-0 items-center gap-2 px-2"
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-1/2 left-[-50%] top-4 h-px",
                    completed || active ? "bg-emerald-300" : "bg-slate-200",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold",
                  completed && "border-emerald-600 bg-emerald-600 text-white",
                  active && "border-ink-950 bg-ink-950 text-white",
                  !completed && !active &&
                    "border-slate-200 bg-white text-slate-400",
                )}
              >
                {completed ? <Check className="size-4" /> : step}
              </span>
              <span
                className={cn(
                  "relative z-10 truncate bg-white pr-1 text-xs font-bold",
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
