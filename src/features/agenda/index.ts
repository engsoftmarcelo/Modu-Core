import { CalendarDays } from "lucide-react";

export const agendaModule = {
  key: "agenda",
  name: "Agenda",
  shortName: "Agenda",
  href: "/agenda",
  description: "Compromissos, atendimentos e disponibilidade em um so lugar.",
  icon: CalendarDays,
  accent: "violet" as const,
  nextSteps: [
    "Visualizar agenda diaria e semanal",
    "Vincular atendimento ao cliente",
    "Confirmar e concluir compromissos",
  ],
};
