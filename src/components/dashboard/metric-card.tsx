import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: "blue" | "violet" | "green" | "amber";
};

const tones = {
  blue: "bg-brand-50 text-brand-700",
  violet: "bg-violet-50 text-violet-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
};

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue",
}: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink-950 sm:text-3xl">
            {value}
          </p>
        </div>
        <span className={cn("grid size-9 place-items-center rounded-lg", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
        {helper}
      </p>
    </Card>
  );
}
