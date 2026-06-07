import { FileText } from "lucide-react";

export const propostasModule = {
  key: "propostas",
  name: "Propostas",
  shortName: "Propostas",
  href: "/propostas",
  description: "Orcamentos profissionais com acompanhamento de status.",
  icon: FileText,
  accent: "green" as const,
  nextSteps: [
    "Montar proposta por servicos",
    "Calcular desconto e valor total",
    "Acompanhar envio e aceite",
  ],
};
