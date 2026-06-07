import { Bell, ChevronDown, Search } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { getInitials } from "@/lib/utils";

type TopbarProps = {
  fullName: string;
  email: string;
};

export function Topbar({ fullName, email }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200/70 bg-[#f5f7fb]/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Logo compact className="lg:hidden" />

      <div className="hidden max-w-md flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm md:flex">
        <Search className="size-4" />
        <span className="py-3 text-sm">Buscar cliente, tarefa ou proposta...</span>
        <kbd className="ml-auto rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
          CTRL K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notificacoes"
          className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-ink-950"
        >
          <Bell className="size-5" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm">
          <span className="grid size-9 place-items-center rounded-lg bg-ink-950 text-xs font-bold text-white">
            {getInitials(fullName)}
          </span>
          <div className="hidden max-w-36 sm:block">
            <p className="truncate text-sm font-bold text-ink-950">{fullName}</p>
            <p className="truncate text-xs text-slate-400">{email}</p>
          </div>
          <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
        </div>
      </div>
    </header>
  );
}
