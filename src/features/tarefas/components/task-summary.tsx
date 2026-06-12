import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, ListChecks } from "lucide-react";

import { Card } from "@/components/ui/card";

import type { TaskStats } from "../queries";

const items = [
  {
    key: "open",
    label: "Em aberto",
    href: "/tarefas?status=pending",
    icon: ListChecks,
    iconClassName: "bg-amber-50 text-amber-700",
  },
  {
    key: "dueToday",
    label: "Para hoje",
    href: "/tarefas",
    icon: CalendarDays,
    iconClassName: "bg-blue-50 text-blue-700",
  },
  {
    key: "overdue",
    label: "Atrasadas",
    href: "/tarefas",
    icon: AlertTriangle,
    iconClassName: "bg-red-50 text-red-700",
  },
  {
    key: "done",
    label: "Concluidas",
    href: "/tarefas?status=done",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-700",
  },
] as const;

export function TaskSummary({ stats }: { stats: TaskStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link key={item.key} href={item.href}>
            <Card className="flex h-full items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md sm:p-5">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.iconClassName}`}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink-950">
                  {stats[item.key]}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
