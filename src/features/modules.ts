import type { LucideIcon } from "lucide-react";

import { agendaModule } from "@/features/agenda";
import { crmModule } from "@/features/crm";
import { dashboardModule } from "@/features/dashboard";
import { matriculasModule } from "@/features/matriculas";
import { ordensServicoModule } from "@/features/ordens-servico";
import { propostasModule } from "@/features/propostas";
import { tarefasModule } from "@/features/tarefas";

export type ModuleConfig = {
  key: string;
  name: string;
  shortName: string;
  href: string;
  description: string;
  icon: LucideIcon;
  accent: "blue" | "violet" | "green" | "amber";
  nextSteps: readonly string[];
};

export const modules: ModuleConfig[] = [
  dashboardModule,
  crmModule,
  agendaModule,
  propostasModule,
  tarefasModule,
  matriculasModule,
  ordensServicoModule,
];

export const operationalModules = modules.filter(
  (module) => module.key !== "dashboard",
);
