"use client";

import Link from "next/link";
import { CalendarDays, Scissors, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <nav
      aria-label="Areas da agenda"
      className="flex max-w-full snap-x overflow-x-auto border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive(pathname);

        return (
          <Link
            ref={active ? activeTabRef : undefined}
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors",
              active
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-ink-950",
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
