import Link from "next/link";
import {
  Plus,
  RotateCcw,
  SearchX,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateTone = "amber" | "blue" | "green" | "slate" | "violet";

type EmptyStateAction = {
  href: string;
  icon?: LucideIcon;
  label: string;
};

type EmptyStateProps = {
  className?: string;
  description: string;
  icon: LucideIcon;
  primaryAction: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  title: string;
  tone?: EmptyStateTone;
};

const toneClasses: Record<EmptyStateTone, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  blue: "bg-brand-50 text-brand-700 ring-brand-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

function EmptyStateLink({
  action,
  primary = false,
}: {
  action: EmptyStateAction;
  primary?: boolean;
}) {
  const ActionIcon = action.icon;

  return (
    <Link
      href={action.href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
        primary
          ? "border-brand-600 bg-brand-600 text-white shadow-sm hover:border-brand-700 hover:bg-brand-700"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-ink-950",
      )}
    >
      {ActionIcon ? <ActionIcon className="size-4" aria-hidden="true" /> : null}
      {action.label}
    </Link>
  );
}

export function EmptyState({
  className,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  title,
  tone = "slate",
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "grid min-h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center sm:px-8",
        className,
      )}
    >
      <div className="max-w-lg">
        <span
          className={cn(
            "mx-auto grid size-13 place-items-center rounded-lg ring-4",
            toneClasses[tone],
          )}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-xl font-bold text-ink-950 sm:text-2xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <EmptyStateLink action={primaryAction} primary />
          {secondaryAction ? (
            <EmptyStateLink action={secondaryAction} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

type CollectionEmptyStateProps = {
  clearHref: string;
  createHref: string;
  createLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  filteredDescription: string;
  filteredTitle: string;
  hasFilters?: boolean;
  icon: LucideIcon;
  tone?: EmptyStateTone;
};

export function CollectionEmptyState({
  clearHref,
  createHref,
  createLabel,
  emptyDescription,
  emptyTitle,
  filteredDescription,
  filteredTitle,
  hasFilters = false,
  icon,
  tone,
}: CollectionEmptyStateProps) {
  return (
    <EmptyState
      icon={hasFilters ? SearchX : icon}
      tone={hasFilters ? "slate" : tone}
      title={hasFilters ? filteredTitle : emptyTitle}
      description={hasFilters ? filteredDescription : emptyDescription}
      primaryAction={
        hasFilters
          ? {
              href: clearHref,
              icon: RotateCcw,
              label: "Limpar filtros",
            }
          : {
              href: createHref,
              icon: Plus,
              label: createLabel,
            }
      }
      secondaryAction={
        hasFilters
          ? {
              href: createHref,
              icon: Plus,
              label: createLabel,
            }
          : undefined
      }
    />
  );
}
