// Mensagens prontas para WhatsApp a partir de um agendamento.
// Sem API oficial ainda: cada template vira um link https://wa.me/55NUMERO?text=...
// que abre o WhatsApp com o texto ja preenchido.

export type WhatsappTemplateKey =
  | "confirmacao"
  | "lembrete"
  | "reagendamento"
  | "retorno"
  | "cobranca";

export type WhatsappTemplate = {
  key: WhatsappTemplateKey;
  label: string;
  description: string;
  text: string;
};

export type AppointmentMessageInput = {
  customerName: string | null;
  serviceName: string | null;
  professionalName: string | null;
  dayLabel: string;
  timeLabel: string;
  businessName: string;
};

// Normaliza um numero para o formato aceito pelo wa.me (somente digitos, com
// codigo do pais). Numeros locais brasileiros (10 ou 11 digitos) recebem o 55.
// Retorna null quando nao ha digitos suficientes para um telefone valido.
export function normalizeBrazilWhatsapp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 10) {
    return null;
  }

  if (digits.startsWith("55") && digits.length >= 12) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

// Monta o link do WhatsApp com a mensagem ja codificada. Retorna null quando o
// numero e invalido, para o chamador tratar o estado vazio.
export function buildWhatsappLink(
  value: string | null,
  message: string,
): string | null {
  const number = normalizeBrazilWhatsapp(value);

  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function firstNameOf(name: string | null): string | null {
  if (!name) {
    return null;
  }

  const first = name.trim().split(/\s+/)[0];
  return first || null;
}

export function buildAppointmentMessages(
  input: AppointmentMessageInput,
): WhatsappTemplate[] {
  const { serviceName, professionalName, dayLabel, timeLabel, businessName } =
    input;

  const firstName = firstNameOf(input.customerName);
  const hi = firstName ? `Ola, ${firstName}!` : "Ola!";
  const service = serviceName?.trim() || null;
  const professional = professionalName?.trim() || null;

  // "o seu horario de Corte com Ana em Segunda-feira, 12 de junho, as 14:00"
  const schedule =
    `o seu horario${service ? ` de ${service}` : ""}` +
    `${professional ? ` com ${professional}` : ""}` +
    ` em ${dayLabel}, as ${timeLabel}`;

  return [
    {
      key: "confirmacao",
      label: "Confirmacao",
      description: "Confirme a presenca antes do atendimento.",
      text: `${hi} Aqui e da ${businessName}. Estou confirmando ${schedule}. Podemos confirmar a sua presenca? 😊`,
    },
    {
      key: "lembrete",
      label: "Lembrete",
      description: "Envie no dia anterior ou algumas horas antes.",
      text: `${hi} Passando para lembrar ${schedule}. Te esperamos! 💜 — ${businessName}`,
    },
    {
      key: "reagendamento",
      label: "Reagendamento",
      description: "Proponha uma nova data quando precisar remarcar.",
      text: `${hi} Precisamos remarcar ${schedule}. Qual outro dia e horario ficam melhores para voce? — ${businessName}`,
    },
    {
      key: "retorno",
      label: "Retorno",
      description: "Convide o cliente a voltar depois de um tempo.",
      text: `${hi} Ja faz um tempinho desde o seu ultimo atendimento${service ? ` de ${service}` : ""} com a ${businessName}. Que tal agendar um retorno? E so me dizer o melhor dia. 😉`,
    },
    {
      key: "cobranca",
      label: "Cobranca amigavel",
      description: "Lembrete gentil sobre um pagamento pendente.",
      text: `${hi} Tudo bem? Passando para lembrar, com carinho, sobre o pagamento${service ? ` do ${service}` : ""} referente ao atendimento em ${dayLabel}. Qualquer duvida, estou a disposicao. Obrigado! 🙏 — ${businessName}`,
    },
  ];
}
