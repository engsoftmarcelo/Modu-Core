"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseServiceForm } from "./schema";
import type { ServiceFormState } from "./types";

const serviceIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): ServiceFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): ServiceFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

const duplicateNameError = validationError({
  name: ["Ja existe um servico com este nome."],
});

export async function createServiceAction(
  _previousState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const parsed = parseServiceForm(formData);

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
    .from("services")
    .insert({
      organization_id: identity.organizationId,
      name: values.name,
      description: nullable(values.description),
      price: values.price,
      duration_minutes: values.durationMinutes,
      active: values.active,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    return duplicateNameError;
  }

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o servico. Tente novamente em instantes.",
    );
  }

  revalidatePath("/agenda/servicos");
  revalidatePath("/agenda/profissionais");
  redirect(`/agenda/servicos/${data.id}?created=1`);
}

export async function updateServiceAction(
  serviceId: string,
  _previousState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  if (!serviceIdSchema.safeParse(serviceId).success) {
    return databaseError("Servico invalido.");
  }

  const parsed = parseServiceForm(formData);

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
    .from("services")
    .update({
      name: values.name,
      description: nullable(values.description),
      price: values.price,
      duration_minutes: values.durationMinutes,
      active: values.active,
    })
    .eq("id", serviceId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") {
    return duplicateNameError;
  }

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o servico. Confira se ele ainda existe.",
    );
  }

  revalidatePath("/agenda/servicos");
  revalidatePath(`/agenda/servicos/${serviceId}`);
  revalidatePath("/agenda/profissionais");
  redirect(`/agenda/servicos/${serviceId}?updated=1`);
}

export async function updateServiceActiveAction(
  serviceId: string,
  active: boolean,
) {
  const parsedId = serviceIdSchema.safeParse(serviceId);
  const parsedActive = z.boolean().safeParse(active);

  if (!parsedId.success || !parsedActive.success) {
    return { error: "Nao foi possivel identificar o servico." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .update({ active: parsedActive.data })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar a situacao do servico." };
  }

  revalidatePath("/agenda/servicos");
  revalidatePath(`/agenda/servicos/${serviceId}`);
  revalidatePath("/agenda/profissionais");

  return { error: null };
}

export async function deleteServiceAction(serviceId: string) {
  if (!serviceIdSchema.safeParse(serviceId).success) {
    return { error: "Servico invalido." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir o servico. Tente novamente." };
  }

  revalidatePath("/agenda/servicos");
  revalidatePath("/agenda/profissionais");
  redirect("/agenda/servicos?deleted=1");
}
