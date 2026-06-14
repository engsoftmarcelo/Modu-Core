"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  nullable,
  parseRelationship,
  parseTaskForm,
  toTaskDueAtIso,
} from "./schema";
import {
  taskStatuses,
  type TaskFormState,
  type TaskStatus,
} from "./types";

const taskIdSchema = z.uuid();
const taskStatusSchema = z.enum(taskStatuses);

function validationError(
  errors: Partial<Record<string, string[]>>,
): TaskFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): TaskFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

async function relationBelongsToOrganization(
  type: "customer" | "lead" | null,
  id: string | null,
  organizationId: string,
) {
  if (!type || !id) return true;

  const supabase = await createClient();
  const result =
    type === "customer"
      ? await supabase
          .from("customers")
          .select("id")
          .eq("id", id)
          .eq("organization_id", organizationId)
          .maybeSingle()
      : await supabase
          .from("leads")
          .select("id")
          .eq("id", id)
          .eq("organization_id", organizationId)
          .maybeSingle();

  return !result.error && Boolean(result.data);
}

export async function createTaskAction(
  _previousState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const parsed = parseTaskForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const relation = parseRelationship(values.relationship);
  const validRelation = await relationBelongsToOrganization(
    relation.type,
    relation.id,
    identity.organizationId,
  );

  if (!validRelation) {
    return validationError({
      relationship: ["O cliente ou lead selecionado nao esta disponivel."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      organization_id: identity.organizationId,
      assignee_id: identity.userId,
      customer_id: relation.customerId,
      lead_id: relation.leadId,
      title: values.title,
      description: nullable(values.description),
      due_at: toTaskDueAtIso(values.dueAt),
      priority: values.priority,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar a tarefa. Tente novamente em instantes.",
    );
  }

  revalidatePath("/tarefas");
  revalidatePath("/crm/dashboard");
  revalidatePath("/dashboard");
  redirect(`/tarefas/${data.id}?created=1`);
}

export async function updateTaskAction(
  taskId: string,
  _previousState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  if (!taskIdSchema.safeParse(taskId).success) {
    return databaseError("Tarefa invalida.");
  }

  const parsed = parseTaskForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const relation = parseRelationship(values.relationship);
  const validRelation = await relationBelongsToOrganization(
    relation.type,
    relation.id,
    identity.organizationId,
  );

  if (!validRelation) {
    return validationError({
      relationship: ["O cliente ou lead selecionado nao esta disponivel."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      customer_id: relation.customerId,
      lead_id: relation.leadId,
      title: values.title,
      description: nullable(values.description),
      due_at: toTaskDueAtIso(values.dueAt),
      priority: values.priority,
      status: values.status,
    })
    .eq("id", taskId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar a tarefa. Confira se ela ainda existe.",
    );
  }

  revalidatePath("/tarefas");
  revalidatePath(`/tarefas/${taskId}`);
  revalidatePath("/crm/dashboard");
  revalidatePath("/dashboard");
  redirect(`/tarefas/${taskId}?updated=1`);
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
) {
  const parsedId = taskIdSchema.safeParse(taskId);
  const parsedStatus = taskStatusSchema.safeParse(status);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Nao foi possivel identificar a tarefa ou o status." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar o status da tarefa." };
  }

  revalidatePath("/tarefas");
  revalidatePath(`/tarefas/${taskId}`);
  revalidatePath("/crm/dashboard");
  revalidatePath("/dashboard");

  return { error: null };
}

export async function deleteTaskAction(taskId: string) {
  if (!taskIdSchema.safeParse(taskId).success) {
    return { error: "Tarefa invalida." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir a tarefa. Tente novamente." };
  }

  revalidatePath("/tarefas");
  revalidatePath("/crm/dashboard");
  revalidatePath("/dashboard");
  redirect("/tarefas?deleted=1");
}
