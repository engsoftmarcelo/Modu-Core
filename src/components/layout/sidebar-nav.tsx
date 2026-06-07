"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  primaryNavigation,
  utilityNavigation,
} from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

function NavItem({
  item,
}: {
  item: (typeof primaryNavigation)[number];
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/inicio" && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
        active
          ? "bg-ink-950 text-white shadow-md shadow-indigo-950/10"
          : "text-slate-500 hover:bg-slate-100 hover:text-ink-950",
      )}
    >
      <Icon
        className={cn(
          "size-[18px]",
          active ? "text-violet-300" : "text-slate-400 group-hover:text-brand-600",
        )}
      />
      {item.name}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <nav className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-1 overflow-y-auto pr-1">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Operacao
        </p>
        {primaryNavigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>

      <div className="mt-auto border-t border-slate-200 pt-4">
        {utilityNavigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </nav>
  );
}
