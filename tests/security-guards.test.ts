import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSafeInternalPath,
  resolveSiteOrigin,
} from "@/lib/navigation";
import { canAdministerWorkspace } from "@/lib/permissions";
import {
  getSalesWhatsAppHref,
  resolveSalesWhatsAppNumber,
} from "@/lib/sales-whatsapp";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSafeInternalPath", () => {
  it("preserva apenas caminhos da propria aplicacao", () => {
    expect(getSafeInternalPath("/crm?status=active")).toBe(
      "/crm?status=active",
    );
    expect(getSafeInternalPath("https://example.com/phishing")).toBe(
      "/inicio",
    );
    expect(getSafeInternalPath("//example.com/phishing")).toBe("/inicio");
    expect(getSafeInternalPath("/\\example.com/phishing")).toBe("/inicio");
  });
});

describe("resolveSiteOrigin", () => {
  it("prioriza a URL configurada e remove caminhos adicionais", () => {
    expect(
      resolveSiteOrigin({
        configuredSiteUrl: "https://modu-core.vercel.app/cadastro",
        environment: "production",
        requestOrigin: "https://example.com",
      }),
    ).toBe("https://modu-core.vercel.app");
  });

  it("nao confia no Origin da requisicao em producao", () => {
    expect(
      resolveSiteOrigin({
        environment: "production",
        requestOrigin: "https://example.com",
      }),
    ).toBeNull();
  });

  it("aceita a origem local durante o desenvolvimento", () => {
    expect(
      resolveSiteOrigin({
        environment: "development",
        requestOrigin: "http://localhost:3000",
      }),
    ).toBe("http://localhost:3000");
  });
});

describe("canAdministerWorkspace", () => {
  it("restringe administracao a owners e admins", () => {
    expect(canAdministerWorkspace("owner")).toBe(true);
    expect(canAdministerWorkspace("admin")).toBe(true);
    expect(canAdministerWorkspace("member")).toBe(false);
    expect(canAdministerWorkspace(null)).toBe(false);
  });
});

describe("contato comercial", () => {
  it("normaliza numeros validos e rejeita fallback ficticio em producao", () => {
    expect(resolveSalesWhatsAppNumber("+55 (31) 99999-8888", "production"))
      .toBe("5531999998888");
    expect(resolveSalesWhatsAppNumber(undefined, "production")).toBeNull();
    expect(resolveSalesWhatsAppNumber("numero-invalido", "production"))
      .toBeNull();
  });

  it("monta o link com mensagem codificada quando o contato esta configurado", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+55 (31) 99999-8888");

    expect(getSalesWhatsAppHref("Ola, ModuCore!"))
      .toBe("https://wa.me/5531999998888?text=Ola%2C%20ModuCore!");
  });
});
