import { ListChecks } from "lucide-react";

export const tarefasModule = {
  key: "tarefas",
  name: "Tarefas",
  shortName: "Tarefas",
  href: "/tarefas",
  description: "Pendencias da equipe priorizadas por prazo e responsavel.",
  icon: ListChecks,
  accent: "amber" as const,
  nextSteps: [
    "Acompanhar tarefas e follow-ups",
    "Priorizar pendencias por prazo",
    "Relacionar clientes e leads",
  ],
};
