"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseProposalForm } from "./schema";
import {
  proposalStatuses,
  type ProposalFormState,
  type ProposalStatus,
} from "./types";

const proposalIdSchema = z.uuid();
const proposalStatusSchema = z.enum(proposalStatuses);

function validationError(
  errors: Partial<Record<string, string[]>>,
): ProposalFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): ProposalFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
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

export async function createProposalAction(
  _previousState: ProposalFormState,
  formData: FormData,
): Promise<ProposalFormState> {
  const parsed = parseProposalForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const validCustomer = await customerBelongsToOrganization(
    values.customerId,
    identity.organizationId,
  );

  if (!validCustomer) {
    return validationError({
      customerId: ["O cliente selecionado nao esta disponivel."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      organization_id: identity.organizationId,
      customer_id: values.customerId,
      title: values.title,
      services: values.services,
      subtotal: values.value,
      discount: 0,
      total: values.value,
      valid_until: values.validUntil,
      status: values.status,
      notes: nullable(values.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar a proposta. Tente novamente em instantes.",
    );
  }

  revalidatePath("/propostas");
  revalidatePath("/dashboard");
  redirect(`/propostas/${data.id}?created=1`);
}

export async function updateProposalAction(
  proposalId: string,
  _previousState: ProposalFormState,
  formData: FormData,
): Promise<ProposalFormState> {
  if (!proposalIdSchema.safeParse(proposalId).success) {
    return databaseError("Proposta invalida.");
  }

  const parsed = parseProposalForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const validCustomer = await customerBelongsToOrganization(
    values.customerId,
    identity.organizationId,
  );

  if (!validCustomer) {
    return validationError({
      customerId: ["O cliente selecionado nao esta disponivel."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .update({
      customer_id: values.customerId,
      title: values.title,
      services: values.services,
      subtotal: values.value,
      discount: 0,
      total: values.value,
      valid_until: values.validUntil,
      status: values.status,
      notes: nullable(values.notes),
    })
    .eq("id", proposalId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar a proposta. Confira se ela ainda existe.",
    );
  }

  revalidatePath("/propostas");
  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath("/dashboard");
  redirect(`/propostas/${proposalId}?updated=1`);
}

export async function updateProposalStatusAction(
  proposalId: string,
  status: ProposalStatus,
) {
  const parsedId = proposalIdSchema.safeParse(proposalId);
  const parsedStatus = proposalStatusSchema.safeParse(status);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Nao foi possivel identificar a proposta ou o status." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar o status da proposta." };
  }

  revalidatePath("/propostas");
  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath("/dashboard");

  return { error: null };
}

export async function deleteProposalAction(proposalId: string) {
  if (!proposalIdSchema.safeParse(proposalId).success) {
    return { error: "Proposta invalida." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", proposalId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir a proposta. Tente novamente." };
  }

  revalidatePath("/propostas");
  revalidatePath("/dashboard");
  redirect("/propostas?deleted=1");
}
