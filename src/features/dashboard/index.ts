import { LayoutDashboard } from "lucide-react";

export const dashboardModule = {
  key: "dashboard",
  name: "Dashboard",
  shortName: "Resumo",
  href: "/dashboard",
  description: "Indicadores essenciais para decidir onde agir primeiro.",
  icon: LayoutDashboard,
  accent: "blue" as const,
  nextSteps: [
    "Acompanhar indicadores comerciais",
    "Ver compromissos proximos",
    "Identificar pendencias prioritarias",
  ],
};
