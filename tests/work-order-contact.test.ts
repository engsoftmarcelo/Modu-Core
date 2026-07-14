import { describe, expect, it } from "vitest";

import {
  buildTelephoneHref,
  buildWorkOrderWhatsappLink,
  normalizeBrazilPhone,
} from "@/features/ordens-servico/contact";

describe("contatos da ordem de servico", () => {
  it("normaliza telefones brasileiros para ligacao e WhatsApp", () => {
    expect(normalizeBrazilPhone("(31) 99999-8888")).toBe("5531999998888");
    expect(normalizeBrazilPhone("+55 31 99999-8888")).toBe("5531999998888");
    expect(buildTelephoneHref("(31) 3333-2222")).toBe(
      "tel:+553133332222",
    );
  });

  it("rejeita numeros incompletos", () => {
    expect(normalizeBrazilPhone("12345")).toBeNull();
    expect(buildTelephoneHref(null)).toBeNull();
  });

  it("monta uma mensagem da O.S. pronta para o WhatsApp", () => {
    const link = buildWorkOrderWhatsappLink("31999998888", {
      address: "Rua das Flores, 120",
      customerName: "Maria Silva",
      reference: "ABC12345",
      serviceType: "Manutencao eletrica",
    });

    expect(link).toBe(
      "https://wa.me/5531999998888?text=" +
        "Ola%2C%20Maria!%20Estou%20entrando%20em%20contato%20sobre%20a%20O.S.%20%23ABC12345%20de%20Manutencao%20eletrica%2C%20no%20endereco%20Rua%20das%20Flores%2C%20120.",
    );
  });
});
