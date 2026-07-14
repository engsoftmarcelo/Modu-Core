type WorkOrderWhatsappMessageInput = {
  address: string;
  customerName: string | null;
  reference: string;
  serviceType: string;
};

export function normalizeBrazilPhone(value: string | null): string | null {
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

export function buildTelephoneHref(value: string | null): string | null {
  const number = normalizeBrazilPhone(value);

  return number ? `tel:+${number}` : null;
}

export function buildWorkOrderWhatsappLink(
  value: string | null,
  input: WorkOrderWhatsappMessageInput,
): string | null {
  const number = normalizeBrazilPhone(value);

  if (!number) {
    return null;
  }

  const firstName = input.customerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Ola, ${firstName}!` : "Ola!";
  const message =
    `${greeting} Estou entrando em contato sobre a O.S. #${input.reference} ` +
    `de ${input.serviceType}, no endereco ${input.address}.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
