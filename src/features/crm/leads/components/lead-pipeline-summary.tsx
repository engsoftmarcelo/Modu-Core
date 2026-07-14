import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  leadStatusLabels,
  leadStatuses,
  type LeadStatus,
} from "../types";
import type { LeadStats } from "../queries";

const statusClasses: Record<LeadStatus, string> = {
  new: "bg-brand-500",
  contacted: "bg-violet-500",
  proposal_sent: "bg-amber-500",
  negotiation: "bg-indigo-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

export function LeadPipelineSummary({ stats }: { stats: LeadStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {leadStatuses.map((status) => (
        <Link key={status} href={`/crm/leads?view=list&status=${status}`}>
          <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
            <div
              className={cn("mb-4 h-1.5 w-10 rounded-full", statusClasses[status])}
            />
            <p className="text-xs font-bold uppercase text-slate-500">
              {leadStatusLabels[status]}
            </p>
            <p className="mt-2 text-2xl font-bold text-ink-950">
              {stats[status]}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
