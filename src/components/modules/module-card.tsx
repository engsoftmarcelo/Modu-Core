import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <Link href={module.href} className="group block">
      <Card className="h-full p-5 transition duration-200 group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:shadow-lg group-hover:shadow-brand-100/60">
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "grid size-12 place-items-center rounded-2xl",
              accentClasses[module.accent],
            )}
          >
            <Icon className="size-6" />
          </span>
          <ArrowUpRight className="size-5 text-slate-300 transition group-hover:text-brand-600" />
        </div>
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink-950">{module.name}</h3>
            <Badge tone="slate">Base pronta</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {module.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
