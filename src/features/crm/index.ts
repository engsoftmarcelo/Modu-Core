import { UsersRound } from "lucide-react";

export const crmModule = {
  key: "crm",
  name: "CRM",
  shortName: "CRM",
  href: "/crm",
  description: "Clientes e oportunidades em um funil simples de acompanhar.",
  icon: UsersRound,
  accent: "blue" as const,
  nextSteps: [
    "Cadastrar e importar clientes",
    "Organizar leads por etapa",
    "Registrar historico de contatos",
  ],
};
