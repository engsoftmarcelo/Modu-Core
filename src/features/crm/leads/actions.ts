"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseLeadForm } from "./schema";
import {
  leadKanbanStatuses,
  type LeadFormState,
  type LeadKanbanStatus,
} from "./types";

const leadIdSchema = z.uuid();
const leadKanbanStatusSchema = z.enum(leadKanbanStatuses);

function validationError(
  errors: Partial<Record<string, string[]>>,
): LeadFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): LeadFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

export async function createLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = parseLeadForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      organization_id: identity.organizationId,
      owner_id: identity.userId,
      name: values.name,
      company: nullable(values.company),
      phone: nullable(values.phone),
      email: nullable(values.email.toLowerCase()),
      source: nullable(values.source),
      status: values.status,
      estimated_value: values.estimatedValue,
      notes: nullable(values.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o lead. Tente novamente em instantes.",
    );
  }

  revalidatePath("/crm/leads");
  revalidatePath("/dashboard");
  redirect(`/crm/leads/${data.id}?created=1`);
}

export async function updateLeadAction(
  leadId: string,
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  if (!leadIdSchema.safeParse(leadId).success) {
    return databaseError("Lead invalido.");
  }

  const parsed = parseLeadForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      name: values.name,
      company: nullable(values.company),
      phone: nullable(values.phone),
      email: nullable(values.email.toLowerCase()),
      source: nullable(values.source),
      status: values.status,
      estimated_value: values.estimatedValue,
      notes: nullable(values.notes),
    })
    .eq("id", leadId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o lead. Confira se ele ainda existe.",
    );
  }

  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/dashboard");
  redirect(`/crm/leads/${leadId}?updated=1`);
}

export async function deleteLeadAction(leadId: string) {
  if (!leadIdSchema.safeParse(leadId).success) {
    return { error: "Lead invalido." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Nao foi possivel excluir o lead. Tente novamente.",
    };
  }

  revalidatePath("/crm/leads");
  revalidatePath("/dashboard");
  redirect("/crm/leads?deleted=1");
}

export async function moveLeadStageAction(
  leadId: string,
  status: LeadKanbanStatus,
) {
  const parsedId = leadIdSchema.safeParse(leadId);
  const parsedStatus = leadKanbanStatusSchema.safeParse(status);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Nao foi possivel identificar a etapa do lead." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel mover o lead. Tente novamente." };
  }

  revalidatePath("/crm/leads");
  revalidatePath("/dashboard");

  return { error: null };
}
