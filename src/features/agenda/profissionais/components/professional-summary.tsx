import Link from "next/link";
import { PowerOff, Scissors, UserCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

import type { ProfessionalStats } from "../queries";

export function ProfessionalSummary({ stats }: { stats: ProfessionalStats }) {
  const items = [
    {
      key: "active",
      label: "Profissionais ativos",
      href: "/agenda/profissionais?situation=active",
      value: String(stats.active),
      icon: UserCheck,
      iconClassName: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "inactive",
      label: "Inativos",
      href: "/agenda/profissionais?situation=inactive",
      value: String(stats.inactive),
      icon: PowerOff,
      iconClassName: "bg-slate-100 text-slate-600",
    },
    {
      key: "coveredServices",
      label: "Servicos atendidos",
      href: "/agenda/servicos",
      value: String(stats.coveredServices),
      icon: Scissors,
      iconClassName: "bg-violet-50 text-violet-700",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
