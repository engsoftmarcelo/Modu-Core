import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CrmMetricCardProps = {
  helper: string;
  href: string;
  icon: LucideIcon;
  label: string;
  tone: "blue" | "violet" | "amber" | "green" | "slate";
  value: number | string;
};

const tones = {
  blue: "bg-brand-50 text-brand-700",
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
};

export function CrmMetricCard({
  helper,
  href,
  icon: Icon,
  label,
  tone,
  value,
}: CrmMetricCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl",
              tones[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
          <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-brand-600" />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 truncate text-3xl font-bold text-ink-950">
          {value}
        </p>
        <p className="mt-3 text-xs font-medium leading-5 text-slate-500">
          {helper}
        </p>
      </Card>
    </Link>
  );
}
