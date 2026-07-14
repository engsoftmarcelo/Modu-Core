import Link from "next/link";
import {
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Send,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import type { ProposalStats } from "../queries";

const items = [
  {
    key: "draft",
    label: "Rascunhos",
    href: "/propostas?status=draft",
    icon: FileText,
    iconClassName: "bg-slate-100 text-slate-600",
  },
  {
    key: "sent",
    label: "Enviadas",
    href: "/propostas?status=sent",
    icon: Send,
    iconClassName: "bg-blue-50 text-blue-700",
  },
  {
    key: "accepted",
    label: "Aceitas",
    href: "/propostas?status=accepted",
    icon: CheckCircle2,
    iconClassName: "bg-emerald-50 text-emerald-700",
  },
] as const;

export function ProposalSummary({ stats }: { stats: ProposalStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link key={item.key} href={item.href}>
            <Card className="flex h-full items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.iconClassName}`}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-ink-950">
                  {stats[item.key]}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}

      <Link href="/propostas?status=accepted">
        <Card className="flex h-full items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <CircleDollarSign className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-slate-500">
              Valor aceito
            </p>
            <p className="mt-1 truncate text-2xl font-bold text-ink-950">
              {formatCurrency(stats.acceptedValue)}
            </p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
