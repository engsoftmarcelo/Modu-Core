import { Building2 } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Logo } from "@/components/ui/logo";

type SidebarProps = {
  organizationName: string;
};

export function Sidebar({ organizationName }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/80 bg-white/95 p-5 backdrop-blur lg:flex lg:flex-col">
      <Logo className="px-2" />

      <div className="my-7 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
          <Building2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink-950">
            {organizationName}
          </p>
          <p className="text-xs text-slate-500">Espaco principal</p>
        </div>
      </div>

      <SidebarNav />
    </aside>
  );
}
