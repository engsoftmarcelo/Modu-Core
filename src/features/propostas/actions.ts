"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { parseProposalForm } from "./schema";
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
  const { data: proposalId, error } = await supabase.rpc(
    "save_simple_proposal",
    {
      p_customer_id: values.customerId,
      p_proposal_id: null,
      p_proposal_notes: values.notes,
      p_proposal_status: values.status,
      p_proposal_title: values.title,
      p_proposal_value: values.value,
      p_service_description: values.services,
      p_valid_until_date: values.validUntil,
    },
  );

  if (error || !proposalId) {
    return databaseError(
      "Nao foi possivel criar a proposta. Tente novamente em instantes.",
    );
  }

  revalidatePath("/propostas");
  revalidatePath("/crm/dashboard");
  revalidatePath("/dashboard");
  redirect(`/propostas/${proposalId}?created=1`);
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
  const { data: savedProposalId, error } = await supabase.rpc(
    "save_simple_proposal",
    {
      p_customer_id: values.customerId,
      p_proposal_id: proposalId,
      p_proposal_notes: values.notes,
      p_proposal_status: values.status,
      p_proposal_title: values.title,
      p_proposal_value: values.value,
      p_service_description: values.services,
      p_valid_until_date: values.validUntil,
    },
  );

  if (error || !savedProposalId) {
    return databaseError(
      "Nao foi possivel atualizar a proposta. Confira se ela ainda existe.",
    );
  }

  revalidatePath("/propostas");
  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath("/crm/dashboard");
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
    .rpc("set_proposal_status", {
      p_proposal_id: parsedId.data,
      p_proposal_status: parsedStatus.data,
    });

  if (error || data !== true) {
    return { error: "Nao foi possivel atualizar o status da proposta." };
  }

  revalidatePath("/propostas");
  revalidatePath(`/propostas/${proposalId}`);
  revalidatePath("/crm/dashboard");
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
    .rpc("delete_proposal", { p_proposal_id: proposalId });

  if (error || data !== true) {
    return { error: "Nao foi possivel excluir a proposta. Tente novamente." };
  }

  revalidatePath("/propostas");
  revalidatePath("/crm/dashboard");
  revalidatePath("/dashboard");
  redirect("/propostas?deleted=1");
}
