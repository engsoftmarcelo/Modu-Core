import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type PageHeaderAction = {
  href: string;
  icon?: LucideIcon;
  label: string;
  variant?: "primary" | "secondary";
};

type PageHeaderProps = {
  actionSlot?: React.ReactNode;
  actions?: PageHeaderAction[];
  description: string;
  eyebrow?: string;
  icon?: LucideIcon;
  title: string;
  tone?: "amber" | "blue" | "green" | "violet";
};

const toneClasses = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-brand-200 bg-brand-50 text-brand-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

export function PageHeader({
  actionSlot,
  actions = [],
  description,
  eyebrow,
  icon: Icon,
  title,
  tone = "blue",
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            {Icon ? (
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-md border",
                  toneClasses[tone],
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
            ) : null}
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h1 className="text-2xl font-bold text-ink-950 sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      </div>

      {actions.length || actionSlot ? (
        <div
          className={cn(
            "grid shrink-0 gap-2 sm:flex",
            actions.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {actions.map((action) => {
            const ActionIcon = action.icon;
            const primary = action.variant !== "secondary";

            return (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
                  primary
                    ? "border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                {ActionIcon ? <ActionIcon className="size-4" aria-hidden="true" /> : null}
                {action.label}
              </Link>
            );
          })}
          {actionSlot}
        </div>
      ) : null}
    </header>
  );
}
