import { describe, expect, it } from "vitest";

import {
  parseWorkOrderCompletion,
  parseWorkOrderForm,
} from "@/features/ordens-servico/schema";
import { workOrderStatuses } from "@/features/ordens-servico/types";

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

const validValues = {
  address: "Rua das Flores, 120 - Centro",
  customerId: "00000000-0000-4000-8000-000000000501",
  description: "Revisar instalacao e substituir o componente danificado.",
  serviceType: "Manutencao eletrica",
  status: "requested",
  technicianName: "Carlos Lima",
  visitDate: "2026-07-20",
};

describe("schema de ordens de servico", () => {
  it("aceita cliente, endereco, servico, tecnico, data e os seis status", () => {
    workOrderStatuses.forEach((status) => {
      const parsed = parseWorkOrderForm(
        formData({ ...validValues, status }),
      );

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toMatchObject({
          customerId: validValues.customerId,
          serviceType: "Manutencao eletrica",
          status,
          technicianName: "Carlos Lima",
          visitDate: "2026-07-20",
        });
      }
    });
  });

  it("rejeita cliente, data e status invalidos e campos vazios", () => {
    const parsed = parseWorkOrderForm(
      formData({
        address: "Rua",
        customerId: "cliente",
        description: "",
        serviceType: "",
        status: "aguardando",
        technicianName: "",
        visitDate: "20/07/2026",
      }),
    );

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      expect(errors.customerId).toContain("Selecione um cliente valido.");
      expect(errors.address).toContain(
        "Informe um endereco com pelo menos 5 caracteres.",
      );
      expect(errors.description).toContain(
        "Descreva o servico com pelo menos 5 caracteres.",
      );
      expect(errors.technicianName).toContain(
        "Informe o tecnico responsavel.",
      );
      expect(errors.visitDate).toContain("Informe uma data de visita valida.");
      expect(errors.status).toContain("Selecione um status valido.");
    }
  });

  it("valida o aceite e os dados da conclusao", () => {
    const valid = parseWorkOrderCompletion({
      accepted: true,
      approvedBy: "Mariana Oliveira",
      finalNotes: "Equipamento testado e liberado.",
    });

    expect(valid.success).toBe(true);

    const invalid = parseWorkOrderCompletion({
      accepted: false,
      approvedBy: "",
      finalNotes: "a".repeat(2001),
    });

    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      const errors = invalid.error.flatten().fieldErrors;

      expect(errors.approvedBy).toContain("Informe o nome de quem aprovou.");
      expect(errors.finalNotes).toContain("Use no maximo 2000 caracteres.");
      expect(errors.accepted).toContain("Confirme o aceite da conclusao.");
    }
  });
});
