import { ClipboardList } from "lucide-react";

export const ordensServicoModule = {
  key: "ordens-servico",
  name: "Ordens de servico",
  shortName: "Ordens",
  href: "/ordens-servico",
  description: "Execucao, prazos e materiais de cada servico contratado.",
  icon: ClipboardList,
  accent: "green" as const,
  nextSteps: [
    "Abrir ordem a partir do cliente",
    "Registrar andamento e materiais",
    "Concluir e gerar historico",
  ],
};
