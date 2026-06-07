"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavigation } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      {mobileNavigation.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/inicio" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold",
              active ? "bg-brand-50 text-brand-700" : "text-slate-500",
            )}
          >
            <Icon className="size-5" />
            {item.shortName ?? item.name}
          </Link>
        );
      })}
    </nav>
  );
}
