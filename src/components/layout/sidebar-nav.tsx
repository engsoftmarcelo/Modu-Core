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
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30",
        active
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:bg-slate-900 hover:text-white",
      )}
    >
      {active ? (
        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sky-400" />
      ) : null}
      <Icon
        className={cn(
          "size-[18px]",
          active ? "text-sky-300" : "text-slate-500 group-hover:text-sky-300",
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
        <p className="mb-3 px-3 text-[11px] font-bold uppercase text-slate-500">
          Operacao
        </p>
        {primaryNavigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>

      <div className="mt-auto border-t border-slate-800 pt-4">
        {utilityNavigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </nav>
  );
}
