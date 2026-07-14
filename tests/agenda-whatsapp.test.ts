import { describe, expect, it } from "vitest";

import {
  buildAppointmentMessages,
  buildWhatsappLink,
  normalizeBrazilWhatsapp,
  type AppointmentMessageInput,
} from "@/features/agenda/agendamentos/whatsapp";

describe("normalizeBrazilWhatsapp", () => {
  it("prepends 55 to local numbers with 10 or 11 digits", () => {
    expect(normalizeBrazilWhatsapp("(31) 99999-8888")).toBe("5531999998888");
    expect(normalizeBrazilWhatsapp("31 3333-4444")).toBe("553133334444");
  });

  it("keeps numbers that already carry the country code", () => {
    expect(normalizeBrazilWhatsapp("+55 31 99999-8888")).toBe("5531999998888");
  });

  it("returns null when there are not enough digits", () => {
    expect(normalizeBrazilWhatsapp("1234")).toBeNull();
    expect(normalizeBrazilWhatsapp("")).toBeNull();
    expect(normalizeBrazilWhatsapp(null)).toBeNull();
  });
});

describe("buildWhatsappLink", () => {
  it("builds a wa.me link with the message url-encoded", () => {
    const link = buildWhatsappLink("(31) 99999-8888", "Ola, tudo bem?");

    expect(link).toBe(
      "https://wa.me/5531999998888?text=Ola%2C%20tudo%20bem%3F",
    );
  });

  it("returns null for invalid numbers", () => {
    expect(buildWhatsappLink(null, "oi")).toBeNull();
    expect(buildWhatsappLink("123", "oi")).toBeNull();
  });
});

describe("buildAppointmentMessages", () => {
  const baseInput: AppointmentMessageInput = {
    customerName: "Maria Silva",
    serviceName: "Corte de cabelo",
    professionalName: "Ana",
    dayLabel: "Segunda-feira, 12 de junho",
    timeLabel: "14:00",
    businessName: "Studio BH",
  };

  it("returns the five ready-made templates", () => {
    const messages = buildAppointmentMessages(baseInput);

    expect(messages.map((message) => message.key)).toEqual([
      "confirmacao",
      "lembrete",
      "reagendamento",
      "retorno",
      "cobranca",
    ]);
  });

  it("fills in the customer first name, service, professional and time", () => {
    const [confirmacao] = buildAppointmentMessages(baseInput);

    expect(confirmacao.text).toContain("Maria");
    expect(confirmacao.text).not.toContain("Silva");
    expect(confirmacao.text).toContain("Corte de cabelo");
    expect(confirmacao.text).toContain("Ana");
    expect(confirmacao.text).toContain("14:00");
    expect(confirmacao.text).toContain("Studio BH");
  });

  it("gracefully omits missing service, professional and name", () => {
    const messages = buildAppointmentMessages({
      ...baseInput,
      customerName: null,
      serviceName: null,
      professionalName: null,
    });

    const confirmacao = messages[0];

    expect(confirmacao.text.startsWith("Ola!")).toBe(true);
    expect(confirmacao.text).not.toContain("de null");
    expect(confirmacao.text).not.toContain("com null");
    expect(confirmacao.text).toContain("14:00");
  });
});
