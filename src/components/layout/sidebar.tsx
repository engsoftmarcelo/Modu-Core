import { Building2 } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Logo } from "@/components/ui/logo";

type SidebarProps = {
  organizationName: string;
};

export function Sidebar({ organizationName }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800 bg-ink-950 p-4 text-white lg:flex lg:flex-col">
      <Logo inverse className="px-2" />

      <div className="my-6 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-800 text-sky-300">
          <Building2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {organizationName}
          </p>
          <p className="text-xs text-slate-400">Espaco principal</p>
        </div>
      </div>

      <SidebarNav />
    </aside>
  );
}
