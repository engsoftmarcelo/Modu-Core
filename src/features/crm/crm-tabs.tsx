"use client";

import Link from "next/link";
import { Target, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/crm",
    label: "Clientes",
    icon: UsersRound,
    isActive: (pathname: string) => !pathname.startsWith("/crm/leads"),
  },
  {
    href: "/crm/leads",
    label: "Leads",
    icon: Target,
    isActive: (pathname: string) => pathname.startsWith("/crm/leads"),
  },
];

export function CrmTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Areas do CRM"
      className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
              active
                ? "bg-ink-950 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-ink-950",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
