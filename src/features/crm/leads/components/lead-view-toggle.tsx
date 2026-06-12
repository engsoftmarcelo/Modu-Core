import Link from "next/link";
import { Columns3, List } from "lucide-react";

type LeadView = "kanban" | "list";

type LeadViewToggleProps = {
  activeView: LeadView;
};

const views = [
  {
    value: "kanban",
    label: "Pipeline",
    href: "/crm/leads?view=kanban",
    icon: Columns3,
  },
  {
    value: "list",
    label: "Lista",
    href: "/crm/leads?view=list",
    icon: List,
  },
] as const;

export function LeadViewToggle({ activeView }: LeadViewToggleProps) {
  return (
    <div
      aria-label="Visualizacao dos leads"
      className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.value;

        return (
          <Link
            key={view.value}
            href={view.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              isActive
                ? "bg-ink-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink-950"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}
