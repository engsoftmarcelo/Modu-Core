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
    "Criar tarefas com prioridade",
    "Definir prazo e responsavel",
    "Relacionar tarefas a clientes",
  ],
};
