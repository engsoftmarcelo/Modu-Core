"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  parseWorkOrderCompletion,
  parseWorkOrderForm,
  parseWorkOrderQuoteForm,
} from "./schema";
import {
  workOrderAttachmentBucket,
  workOrderChecklistItemKeys,
  workOrderStatuses,
  type WorkOrderChecklistItemKey,
  type WorkOrderChecklistUpdateResult,
  type WorkOrderCompletionInput,
  type WorkOrderCompletionResult,
  type WorkOrderFormState,
  type WorkOrderQuoteFormState,
  type WorkOrderStatus,
} from "./types";

const workOrderIdSchema = z.uuid();
const workOrderStatusSchema = z.enum(workOrderStatuses);
const workOrderChecklistUpdateSchema = z.object({
  completed: z.boolean(),
  itemKey: z.enum(workOrderChecklistItemKeys),
  workOrderId: z.uuid(),
});

function validationError(
  errors: Partial<Record<string, string[]>>,
): WorkOrderFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): WorkOrderFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

function quoteValidationError(
  errors: Partial<Record<string, string[]>>,
): WorkOrderQuoteFormState {
  return {
    status: "error",
    message: "Revise os valores do orcamento.",
    errors,
  };
}

function quoteDatabaseError(message: string): WorkOrderQuoteFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

function completionError(
  message: string,
  errors: WorkOrderCompletionResult["errors"] = {},
): WorkOrderCompletionResult {
  return { error: message, errors };
}

async function customerBelongsToOrganization(
  customerId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return !error && Boolean(data);
}

function revalidateWorkOrders(workOrderId?: string) {
  revalidatePath("/ordens-servico");
  revalidatePath("/dashboard");

  if (workOrderId) {
    revalidatePath(`/ordens-servico/${workOrderId}`);
  }
}

export async function createWorkOrderAction(
  _previousState: WorkOrderFormState,
  formData: FormData,
): Promise<WorkOrderFormState> {
  const demoMode = formData.get("demo") === "1";
  const parsed = parseWorkOrderForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;

  if (values.status === "completed") {
    return validationError({
      status: ["Use a confirmacao de conclusao na tela da ordem."],
    });
  }

  if (["quoted", "approved", "in_progress"].includes(values.status)) {
    return validationError({
      status: ["Crie a ordem como solicitada e registre o orcamento primeiro."],
    });
  }

  if (
    !(await customerBelongsToOrganization(
      values.customerId,
      identity.organizationId,
    ))
  ) {
    return validationError({
      customerId: ["O cliente selecionado nao esta disponivel."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      organization_id: identity.organizationId,
      customer_id: values.customerId,
      address: values.address,
      service_type: values.serviceType,
      description: values.description,
      technician_name: values.technicianName,
      visit_date: values.visitDate,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar a ordem de servico. Tente novamente em instantes.",
    );
  }

  revalidateWorkOrders();
  redirect(
    `/ordens-servico/${data.id}?created=1${demoMode ? "&demo=1" : ""}`,
  );
}

export async function updateWorkOrderAction(
  workOrderId: string,
  _previousState: WorkOrderFormState,
  formData: FormData,
): Promise<WorkOrderFormState> {
  if (!workOrderIdSchema.safeParse(workOrderId).success) {
    return databaseError("Ordem de servico invalida.");
  }

  const parsed = parseWorkOrderForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;

  if (
    !(await customerBelongsToOrganization(
      values.customerId,
      identity.organizationId,
    ))
  ) {
    return validationError({
      customerId: ["O cliente selecionado nao esta disponivel."],
    });
  }

  const supabase = await createClient();

  if (values.status === "completed") {
    const { data: currentOrder, error: lookupError } = await supabase
      .from("work_orders")
      .select("id, status")
      .eq("id", workOrderId)
      .eq("organization_id", identity.organizationId)
      .maybeSingle();

    if (lookupError || !currentOrder) {
      return databaseError("Nao foi possivel localizar esta ordem de servico.");
    }

    if (currentOrder.status !== "completed") {
      return validationError({
        status: ["Use a confirmacao de conclusao na tela da ordem."],
      });
    }
  }

  const { data, error } = await supabase
    .from("work_orders")
    .update({
      customer_id: values.customerId,
      address: values.address,
      service_type: values.serviceType,
      description: values.description,
      technician_name: values.technicianName,
      visit_date: values.visitDate,
      status: values.status,
      ...(values.status !== "completed"
        ? {
            completion_approved_by: null,
            completion_notes: null,
            completion_accepted: false,
            completed_at: null,
          }
        : {}),
    })
    .eq("id", workOrderId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar a ordem. Confira se ela ainda existe.",
    );
  }

  revalidateWorkOrders(workOrderId);
  redirect(`/ordens-servico/${workOrderId}?updated=1`);
}

export async function updateWorkOrderStatusAction(
  workOrderId: string,
  status: WorkOrderStatus,
) {
  const parsedId = workOrderIdSchema.safeParse(workOrderId);
  const parsedStatus = workOrderStatusSchema.safeParse(status);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Nao foi possivel identificar a ordem ou o status." };
  }

  if (parsedStatus.data === "completed") {
    return { error: "Use a confirmacao de conclusao para finalizar a ordem." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_orders")
    .update({
      status: parsedStatus.data,
      completion_approved_by: null,
      completion_notes: null,
      completion_accepted: false,
      completed_at: null,
    })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar o status da ordem." };
  }

  revalidateWorkOrders(workOrderId);
  return { error: null };
}

export async function completeWorkOrderAction(
  workOrderId: string,
  input: WorkOrderCompletionInput,
): Promise<WorkOrderCompletionResult> {
  if (!workOrderIdSchema.safeParse(workOrderId).success) {
    return completionError("Ordem de servico invalida.");
  }

  const parsed = parseWorkOrderCompletion(input);

  if (!parsed.success) {
    return completionError(
      "Revise os dados da confirmacao.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return completionError("Sua sessao expirou. Entre novamente para continuar.");
  }

  const completedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_orders")
    .update({
      status: "completed",
      completion_approved_by: parsed.data.approvedBy,
      completion_notes: parsed.data.finalNotes || null,
      completion_accepted: true,
      completed_at: completedAt,
    })
    .eq("id", workOrderId)
    .eq("organization_id", identity.organizationId)
    .neq("status", "cancelled")
    .select("id, completed_at")
    .maybeSingle();

  if (error || !data) {
    return completionError(
      "Nao foi possivel concluir a ordem. Confira se ela ainda esta ativa.",
    );
  }

  revalidateWorkOrders(workOrderId);
  return { completedAt: data.completed_at ?? completedAt, error: null, errors: {} };
}

export async function saveWorkOrderQuoteAction(
  workOrderId: string,
  _previousState: WorkOrderQuoteFormState,
  formData: FormData,
): Promise<WorkOrderQuoteFormState> {
  if (!workOrderIdSchema.safeParse(workOrderId).success) {
    return quoteDatabaseError("Ordem de servico invalida.");
  }

  const parsed = parseWorkOrderQuoteForm(formData);

  if (!parsed.success) {
    return quoteValidationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return quoteDatabaseError(
      "Sua organizacao nao foi encontrada. Entre novamente.",
    );
  }

  const supabase = await createClient();
  const { data: workOrder, error: lookupError } = await supabase
    .from("work_orders")
    .select("id, status, quoted_at")
    .eq("id", workOrderId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (lookupError || !workOrder) {
    return quoteDatabaseError(
      "Nao foi possivel localizar esta ordem de servico.",
    );
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("work_orders")
    .update({
      quote_materials: values.materials,
      quote_labor: values.labor,
      quote_discount: values.discount,
      quote_term: values.term,
      quoted_at: workOrder.quoted_at ?? new Date().toISOString(),
      ...(workOrder.status === "requested"
        ? { status: "quoted" as const }
        : {}),
    })
    .eq("id", workOrderId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return quoteDatabaseError(
      "Nao foi possivel salvar o orcamento. Tente novamente.",
    );
  }

  revalidateWorkOrders(workOrderId);

  return {
    status: "success",
    message: "Orcamento salvo com sucesso.",
    errors: {},
  };
}

export async function updateWorkOrderChecklistItemAction(
  workOrderId: string,
  itemKey: WorkOrderChecklistItemKey,
  completed: boolean,
): Promise<WorkOrderChecklistUpdateResult> {
  const parsed = workOrderChecklistUpdateSchema.safeParse({
    completed,
    itemKey,
    workOrderId,
  });

  if (!parsed.success) {
    return { error: "Nao foi possivel identificar esta etapa do checklist." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const completedAt = parsed.data.completed ? new Date().toISOString() : null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_order_checklist_items")
    .update({
      completed: parsed.data.completed,
      completed_at: completedAt,
    })
    .eq("work_order_id", parsed.data.workOrderId)
    .eq("organization_id", identity.organizationId)
    .eq("item_key", parsed.data.itemKey)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar o checklist. Tente novamente." };
  }

  revalidateWorkOrders(parsed.data.workOrderId);
  return { completedAt, error: null };
}

export async function deleteWorkOrderAction(workOrderId: string) {
  if (!workOrderIdSchema.safeParse(workOrderId).success) {
    return { error: "Ordem de servico invalida." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data: attachments, error: attachmentLookupError } = await supabase
    .from("work_order_attachments")
    .select("storage_path")
    .eq("work_order_id", workOrderId)
    .eq("organization_id", identity.organizationId);

  if (attachmentLookupError) {
    return { error: "Nao foi possivel verificar os anexos desta ordem." };
  }

  const attachmentPaths = (attachments ?? []).map(
    (attachment) => attachment.storage_path,
  );

  if (attachmentPaths.length) {
    const { error: storageError } = await supabase.storage
      .from(workOrderAttachmentBucket)
      .remove(attachmentPaths);

    if (storageError) {
      return { error: "Nao foi possivel remover os anexos desta ordem." };
    }
  }

  const { data, error } = await supabase
    .from("work_orders")
    .delete()
    .eq("id", workOrderId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir a ordem. Tente novamente." };
  }

  revalidateWorkOrders();
  redirect("/ordens-servico?deleted=1");
}
