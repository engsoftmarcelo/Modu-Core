import { z } from "zod";

import {
  workOrderAttachmentMaxBytes,
  workOrderAttachmentMimeTypes,
  workOrderStatuses,
  type WorkOrderCompletionInput,
} from "./types";

export const workOrderSchema = z.object({
  customerId: z.uuid("Selecione um cliente valido."),
  address: z
    .string()
    .trim()
    .min(5, "Informe um endereco com pelo menos 5 caracteres.")
    .max(500, "Use no maximo 500 caracteres."),
  serviceType: z
    .string()
    .trim()
    .min(2, "Informe o tipo de servico.")
    .max(160, "Use no maximo 160 caracteres."),
  description: z
    .string()
    .trim()
    .min(5, "Descreva o servico com pelo menos 5 caracteres.")
    .max(3000, "Use no maximo 3000 caracteres."),
  technicianName: z
    .string()
    .trim()
    .min(2, "Informe o tecnico responsavel.")
    .max(160, "Use no maximo 160 caracteres."),
  visitDate: z.iso.date("Informe uma data de visita valida."),
  status: z.enum(workOrderStatuses, {
    message: "Selecione um status valido.",
  }),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

const quoteAmountSchema = z.coerce
  .number({ message: "Informe um valor valido." })
  .min(0, "O valor nao pode ser negativo.")
  .max(9999999999.99, "O valor informado e muito alto.")
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
    "Use no maximo duas casas decimais.",
  );

export const workOrderQuoteSchema = z
  .object({
    materials: quoteAmountSchema,
    labor: quoteAmountSchema,
    discount: quoteAmountSchema,
    term: z
      .string()
      .trim()
      .min(2, "Informe o prazo do servico.")
      .max(160, "Use no maximo 160 caracteres."),
  })
  .superRefine((values, context) => {
    const subtotal = values.materials + values.labor;

    if (subtotal <= 0) {
      context.addIssue({
        code: "custom",
        message: "Informe um valor de materiais ou mao de obra.",
        path: ["materials"],
      });
    }

    if (values.discount > subtotal) {
      context.addIssue({
        code: "custom",
        message: "O desconto nao pode superar materiais e mao de obra.",
        path: ["discount"],
      });
    }
  });

export type WorkOrderQuoteFormValues = z.infer<
  typeof workOrderQuoteSchema
>;

export const workOrderAttachmentFileSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "O arquivo precisa ter um nome.")
    .max(180, "O nome do arquivo e muito longo."),
  fileSize: z
    .number({ message: "Nao foi possivel identificar o tamanho do arquivo." })
    .int("O tamanho do arquivo e invalido.")
    .min(1, "O arquivo esta vazio.")
    .max(workOrderAttachmentMaxBytes, "Cada imagem pode ter no maximo 5 MB."),
  mimeType: z.enum(workOrderAttachmentMimeTypes, {
    message: "Use uma imagem JPG, PNG ou WebP.",
  }),
});

export type WorkOrderAttachmentFileValues = z.infer<
  typeof workOrderAttachmentFileSchema
>;

export const workOrderCompletionSchema = z.object({
  approvedBy: z
    .string()
    .trim()
    .min(2, "Informe o nome de quem aprovou.")
    .max(160, "Use no maximo 160 caracteres."),
  finalNotes: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
  accepted: z
    .boolean()
    .refine((accepted) => accepted, "Confirme o aceite da conclusao."),
});

export function parseWorkOrderCompletion(input: WorkOrderCompletionInput) {
  return workOrderCompletionSchema.safeParse(input);
}

export function parseWorkOrderForm(formData: FormData) {
  return workOrderSchema.safeParse({
    customerId: String(formData.get("customerId") ?? ""),
    address: String(formData.get("address") ?? ""),
    serviceType: String(formData.get("serviceType") ?? ""),
    description: String(formData.get("description") ?? ""),
    technicianName: String(formData.get("technicianName") ?? ""),
    visitDate: String(formData.get("visitDate") ?? ""),
    status: String(formData.get("status") ?? "requested"),
  });
}

export function parseWorkOrderQuoteForm(formData: FormData) {
  return workOrderQuoteSchema.safeParse({
    materials: String(formData.get("materials") ?? "0"),
    labor: String(formData.get("labor") ?? "0"),
    discount: String(formData.get("discount") ?? "0"),
    term: String(formData.get("term") ?? ""),
  });
}
