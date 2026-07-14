"use client";

import Link from "next/link";
import { LayoutDashboard, Target, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/crm/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname.startsWith("/crm/dashboard"),
  },
  {
    href: "/crm",
    label: "Clientes",
    icon: UsersRound,
    isActive: (pathname: string) =>
      !pathname.startsWith("/crm/leads") &&
      !pathname.startsWith("/crm/dashboard"),
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
      aria-label="Areas do CRM"
      className="inline-flex max-w-full snap-x scroll-px-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
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
