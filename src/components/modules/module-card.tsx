import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { ModuleConfig } from "@/features/modules";
import { cn } from "@/lib/utils";

const accentClasses = {
  blue: "bg-brand-50 text-brand-700",
  violet: "bg-violet-50 text-violet-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
};

export function ModuleCard({ module }: { module: ModuleConfig }) {
  const Icon = module.icon;

  return (
    <Link href={module.href} className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100">
      <Card className="h-full border-l-[3px] border-l-slate-200 p-5 transition-colors group-hover:border-brand-300 group-hover:border-l-brand-600 group-hover:bg-slate-50/50">
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "grid size-10 place-items-center rounded-lg",
              accentClasses[module.accent],
            )}
          >
            <Icon className="size-5" />
          </span>
          <ArrowUpRight className="size-5 text-slate-300 transition group-hover:text-brand-600" />
        </div>
        <div className="mt-4">
          <h3 className="font-bold text-ink-950">{module.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {module.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
