import type { Metadata } from "next";
import { BriefcaseBusiness, ClipboardCheck, ListChecks, Target } from "lucide-react";

import { ModelPage } from "@/components/marketing/model-page";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

export const metadata: Metadata = {
  title: "CRM B2B para servicos",
  description:
    "Sistema para servicos B2B com leads, propostas, tarefas e acompanhamento comercial.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero ver a demonstracao do CRM B2B da ModuCore.",
);

export default function CrmB2BPage() {
  return (
    <ModelPage
      eyebrow="Modelo CRM B2B"
      title="CRM B2B para empresas de servicos"
      description="Leads, propostas, tarefas e acompanhamento comercial para equipes que vendem por relacionamento e nao podem perder o proximo retorno."
      screenshot="/images/product-crm.png"
      screenshotAlt="Dashboard real do CRM B2B no ModuCore"
      screenshotCaption="Indicadores, pipeline, pendencias e atalhos deixam o andamento comercial visivel para toda a equipe."
      whatsappHref={whatsappHref}
      painTitle="Venda B2B quebra quando o acompanhamento depende da memoria."
      painDescription="Ciclos longos exigem contexto, responsavel e proxima acao. Sem isso, cada oportunidade vira uma conversa que precisa ser reconstruida."
      painPoints={[
        "O retorno fica perdido entre conversas e lembretes pessoais.",
        "A proposta foi enviada, mas ninguem acompanha prazo ou decisao.",
        "O gestor precisa perguntar no grupo para entender o pipeline.",
        "Clientes e leads aparecem duplicados em planilhas diferentes.",
      ]}
      features={[
        {
          title: "Pipeline de leads",
          description: "Etapas, origem, valor estimado e proxima acao por oportunidade.",
          icon: Target,
        },
        {
          title: "Propostas",
          description: "Cliente, valor, validade e status ligados a negociacao.",
          icon: BriefcaseBusiness,
        },
        {
          title: "Tarefas e follow-ups",
          description: "Pendencias por prioridade, prazo e responsavel.",
          icon: ListChecks,
        },
        {
          title: "Historico comercial",
          description: "Contatos, observacoes e proximos passos no perfil do cliente.",
          icon: ClipboardCheck,
        },
      ]}
      flow={[
        "Cadastrar um lead que chegou por indicacao ou WhatsApp.",
        "Atualizar a etapa, o valor estimado e a proxima acao.",
        "Criar uma proposta e vincular tarefas de acompanhamento.",
        "Converter a oportunidade e consultar todo o historico comercial.",
      ]}
    />
  );
}
