"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { primaryNavigation, utilityNavigation } from "@/components/layout/navigation";
import { Logo } from "@/components/ui/logo";
import { getInitials } from "@/lib/utils";

type TopbarProps = {
  fullName: string;
  email: string;
  organizationName: string;
};

export function Topbar({ fullName, email, organizationName }: TopbarProps) {
  const pathname = usePathname();
  const navigation = [...primaryNavigation, ...utilityNavigation];
  const currentItem = navigation
    .filter(
      (item) =>
        pathname === item.href ||
        (item.href !== "/inicio" && pathname.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Logo compact className="lg:hidden" />

      <div className="hidden min-w-0 lg:block">
        <p className="text-sm font-semibold text-ink-950">
          {currentItem?.name ?? "ModuCore"}
        </p>
        <p className="truncate text-xs text-slate-500">{organizationName}</p>
      </div>

      <div className="ml-auto flex items-center">
        <Link
          href="/configuracoes"
          title="Abrir configuracoes"
          aria-label={`Abrir configuracoes de ${fullName}`}
          className="group flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-ink-950 text-xs font-bold text-white">
            {getInitials(fullName)}
          </span>
          <div className="hidden max-w-36 sm:block">
            <p className="truncate text-sm font-bold text-ink-950">{fullName}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <Settings2 className="hidden size-4 text-slate-400 transition-colors group-hover:text-brand-600 sm:block" />
        </Link>
      </div>
    </header>
  );
}
