import { z } from "zod";

const relationshipSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    const [type, id, extra] = value.split(":");
    return (
      !extra &&
      (type === "customer" || type === "lead") &&
      z.uuid().safeParse(id).success
    );
  }, "Selecione um cliente ou lead valido.");

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(180, "Use no maximo 180 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "Use no maximo 2000 caracteres."),
  dueAt: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
      "Informe uma data e horario validos.",
    )
    .refine(
      (value) => !Number.isNaN(Date.parse(`${value}:00-03:00`)),
      "Informe uma data e horario validos.",
    ),
  priority: z.enum(["low", "medium", "high"], {
    message: "Selecione uma prioridade valida.",
  }),
  status: z.enum(["pending", "in_progress", "done", "cancelled"], {
    message: "Selecione um status valido.",
  }),
  relationship: relationshipSchema,
});

export function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dueAt: String(formData.get("dueAt") ?? ""),
    priority: String(formData.get("priority") ?? "medium"),
    status: String(formData.get("status") ?? "pending"),
    relationship: String(formData.get("relationship") ?? ""),
  });
}

export function parseRelationship(value: string) {
  if (!value) {
    return {
      customerId: null,
      leadId: null,
      type: null,
      id: null,
    } as const;
  }

  const [type, id] = value.split(":") as ["customer" | "lead", string];

  return {
    customerId: type === "customer" ? id : null,
    leadId: type === "lead" ? id : null,
    type,
    id,
  };
}

export function toTaskDueAtIso(value: string) {
  return new Date(`${value}:00-03:00`).toISOString();
}

export function nullable(value: string) {
  return value || null;
}
