"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseCustomerForm } from "./schema";
import type { CustomerFormState } from "./types";

const customerIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): CustomerFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): CustomerFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

async function getOrganizationId() {
  const identity = await getWorkspaceIdentity();
  return identity?.organizationId ?? null;
}

export async function createCustomerAction(
  _previousState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseCustomerForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      organization_id: organizationId,
      name: values.name,
      company: nullable(values.company),
      phone: nullable(values.phone),
      whatsapp: nullable(values.whatsapp),
      email: nullable(values.email.toLowerCase()),
      segment: nullable(values.segment),
      notes: nullable(values.notes),
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o cliente. Tente novamente em instantes.",
    );
  }

  revalidatePath("/crm");
  revalidatePath("/dashboard");
  redirect(`/crm/${data.id}?created=1`);
}

export async function updateCustomerAction(
  customerId: string,
  _previousState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  if (!customerIdSchema.safeParse(customerId).success) {
    return databaseError("Cliente invalido.");
  }

  const parsed = parseCustomerForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: values.name,
      company: nullable(values.company),
      phone: nullable(values.phone),
      whatsapp: nullable(values.whatsapp),
      email: nullable(values.email.toLowerCase()),
      segment: nullable(values.segment),
      notes: nullable(values.notes),
      status: values.status,
    })
    .eq("id", customerId)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o cliente. Confira se ele ainda existe.",
    );
  }

  revalidatePath("/crm");
  revalidatePath(`/crm/${customerId}`);
  revalidatePath("/dashboard");
  redirect(`/crm/${customerId}?updated=1`);
}

export async function deleteCustomerAction(customerId: string) {
  if (!customerIdSchema.safeParse(customerId).success) {
    return { error: "Cliente invalido." };
  }

  const organizationId = await getOrganizationId();

  if (!organizationId) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .eq("organization_id", organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      error: "Nao foi possivel excluir o cliente. Tente novamente.",
    };
  }

  revalidatePath("/crm");
  revalidatePath("/dashboard");
  redirect("/crm?deleted=1");
}
