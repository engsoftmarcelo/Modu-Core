import { z } from "zod";

export const proposalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(180, "Use no maximo 180 caracteres."),
  customerId: z.uuid({ message: "Selecione um cliente valido." }),
  services: z
    .string()
    .trim()
    .min(2, "Descreva os servicos incluidos na proposta.")
    .max(2000, "Use no maximo 2000 caracteres."),
  value: z.coerce
    .number({ message: "Informe um valor valido." })
    .min(0, "O valor nao pode ser negativo.")
    .max(9999999999.99, "O valor informado e muito alto."),
  validUntil: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe um prazo valido.")
    .refine(
      (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
      "Informe um prazo valido.",
    ),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"], {
    message: "Selecione um status valido.",
  }),
  notes: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
});

export function parseProposalForm(formData: FormData) {
  return proposalSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    customerId: String(formData.get("customerId") ?? ""),
    services: String(formData.get("services") ?? ""),
    value: String(formData.get("value") ?? "0"),
    validUntil: String(formData.get("validUntil") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    notes: String(formData.get("notes") ?? ""),
  });
}

export function nullable(value: string) {
  return value || null;
}
