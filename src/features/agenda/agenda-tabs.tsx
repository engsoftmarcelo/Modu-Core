"use client";

import Link from "next/link";
import { CalendarDays, Scissors, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
    isActive: (pathname: string) =>
      pathname === "/agenda" || pathname.startsWith("/agenda/agendamentos"),
  },
  {
    href: "/agenda/servicos",
    label: "Servicos",
    icon: Scissors,
    isActive: (pathname: string) => pathname.startsWith("/agenda/servicos"),
  },
  {
    href: "/agenda/profissionais",
    label: "Profissionais",
    icon: UsersRound,
    isActive: (pathname: string) => pathname.startsWith("/agenda/profissionais"),
  },
];

export function AgendaTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Areas da agenda"
      className="inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
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
