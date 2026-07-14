import Link from "next/link";
import { CircleDollarSign, Clock, PowerOff, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatDuration } from "@/lib/utils";

import type { ServiceStats } from "../queries";

export function ServiceSummary({ stats }: { stats: ServiceStats }) {
  const items = [
    {
      key: "active",
      label: "Servicos ativos",
      href: "/agenda/servicos?situation=active",
      value: String(stats.active),
      icon: Sparkles,
      iconClassName: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "inactive",
      label: "Inativos",
      href: "/agenda/servicos?situation=inactive",
      value: String(stats.inactive),
      icon: PowerOff,
      iconClassName: "bg-slate-100 text-slate-600",
    },
    {
      key: "averagePrice",
      label: "Preco medio",
      href: "/agenda/servicos",
      value: formatCurrency(stats.averagePrice, 2),
      icon: CircleDollarSign,
      iconClassName: "bg-blue-50 text-blue-700",
    },
    {
      key: "averageDuration",
      label: "Duracao media",
      href: "/agenda/servicos",
      value: stats.averageDuration ? formatDuration(stats.averageDuration) : "-",
      icon: Clock,
      iconClassName: "bg-violet-50 text-violet-700",
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link key={item.key} href={item.href}>
            <Card className="flex h-full items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-5">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.iconClassName}`}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-2xl font-bold text-ink-950">
                  {item.value}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
