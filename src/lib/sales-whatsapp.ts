const developmentDemoNumber = "5531999998888";

export function resolveSalesWhatsAppNumber(
  value: string | null | undefined,
  environment = process.env.NODE_ENV,
) {
  const normalized = value?.replace(/\D/g, "") ?? "";

  if (/^\d{10,15}$/.test(normalized)) {
    return normalized;
  }

  return environment === "production" ? null : developmentDemoNumber;
}

export function getSalesWhatsAppNumber() {
  return resolveSalesWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );
}

export function getSalesWhatsAppHref(
  message: string,
  fallbackHref = "/diagnostico",
) {
  const number = getSalesWhatsAppNumber();

  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : fallbackHref;
}
