import type { Metadata } from "next";
import { CalendarCheck2, MessageCircle, Scissors, UsersRound } from "lucide-react";

import { ModelPage } from "@/components/marketing/model-page";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

export const metadata: Metadata = {
  title: "Agenda para salao, estetica e atendimento",
  description:
    "Sistema para salao, estetica e atendimento com agenda, confirmacao no WhatsApp e historico de clientes.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero ver a demonstracao da Agenda ModuCore.",
);

export default function AgendaModelPage() {
  return (
    <ModelPage
      tone="violet"
      eyebrow="Modelo Agenda"
      title="Agenda para salao, estetica e atendimento"
      description="Servicos, profissionais, confirmacao no WhatsApp e historico de clientes em um fluxo simples para a recepcao e para quem atende."
      screenshot="/images/product-agenda.png"
      screenshotAlt="Agenda real do ModuCore com calendario de atendimentos"
      screenshotCaption="O calendario mostra horarios e status, enquanto servicos, profissionais e historico permanecem conectados ao atendimento."
      whatsappHref={whatsappHref}
      painTitle="A agenda manual cria conflitos antes mesmo do atendimento."
      painDescription="Quando horarios, confirmacoes e observacoes ficam em lugares diferentes, a equipe perde tempo e o cliente percebe a desorganizacao."
      painPoints={[
        "Horarios duplicados ou alterados sem avisar toda a equipe.",
        "Confirmacoes repetitivas digitadas uma a uma no WhatsApp.",
        "Profissional sem contexto sobre servicos e observacoes do cliente.",
        "Nenhum lembrete claro para o proximo retorno.",
      ]}
      features={[
        {
          title: "Agenda visual",
          description: "Visoes por dia e semana com horarios e status de atendimento.",
          icon: CalendarCheck2,
        },
        {
          title: "Servicos",
          description: "Duracao, preco e descricao para padronizar o cadastro.",
          icon: Scissors,
        },
        {
          title: "Equipe",
          description: "Profissionais vinculados aos servicos e compromissos.",
          icon: UsersRound,
        },
        {
          title: "WhatsApp e historico",
          description: "Confirmacao pronta, comparecimento, observacoes e retorno.",
          icon: MessageCircle,
        },
      ]}
      flow={[
        "Cadastrar o cliente, os servicos e os profissionais.",
        "Criar um agendamento com horario e responsavel.",
        "Enviar a confirmacao pronta pelo WhatsApp.",
        "Registrar comparecimento, observacoes e o proximo retorno.",
      ]}
    />
  );
}
