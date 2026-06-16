"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { nullable, parseProfessionalForm } from "./schema";
import type { ProfessionalFormState } from "./types";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

const professionalIdSchema = z.uuid();

function validationError(
  errors: Partial<Record<string, string[]>>,
): ProfessionalFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): ProfessionalFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

async function servicesBelongToOrganization(
  serviceIds: string[],
  organizationId: string,
) {
  if (!serviceIds.length) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id")
    .eq("organization_id", organizationId)
    .in("id", serviceIds);

  return !error && (data?.length ?? 0) === serviceIds.length;
}

async function syncProfessionalServices(
  supabase: ServerClient,
  professionalId: string,
  organizationId: string,
  serviceIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("professional_services")
    .delete()
    .eq("professional_id", professionalId)
    .eq("organization_id", organizationId);

  if (deleteError) {
    return false;
  }

  if (!serviceIds.length) {
    return true;
  }

  const { error: insertError } = await supabase
    .from("professional_services")
    .insert(
      serviceIds.map((serviceId) => ({
        organization_id: organizationId,
        professional_id: professionalId,
        service_id: serviceId,
      })),
    );

  return !insertError;
}

export async function createProfessionalAction(
  _previousState: ProfessionalFormState,
  formData: FormData,
): Promise<ProfessionalFormState> {
  const parsed = parseProfessionalForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const serviceIds = [...new Set(values.serviceIds)];

  if (!(await servicesBelongToOrganization(serviceIds, identity.organizationId))) {
    return validationError({
      serviceIds: ["Um ou mais servicos selecionados nao estao disponiveis."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .insert({
      organization_id: identity.organizationId,
      name: values.name,
      specialty: nullable(values.specialty),
      available_hours: nullable(values.availableHours),
      active: values.active,
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o profissional. Tente novamente em instantes.",
    );
  }

  const synced = await syncProfessionalServices(
    supabase,
    data.id,
    identity.organizationId,
    serviceIds,
  );

  if (!synced) {
    return databaseError(
      "Profissional criado, mas houve falha ao vincular os servicos. Edite o cadastro para revisar.",
    );
  }

  revalidatePath("/agenda/profissionais");
  redirect(`/agenda/profissionais/${data.id}?created=1`);
}

export async function updateProfessionalAction(
  professionalId: string,
  _previousState: ProfessionalFormState,
  formData: FormData,
): Promise<ProfessionalFormState> {
  if (!professionalIdSchema.safeParse(professionalId).success) {
    return databaseError("Profissional invalido.");
  }

  const parsed = parseProfessionalForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const serviceIds = [...new Set(values.serviceIds)];

  if (!(await servicesBelongToOrganization(serviceIds, identity.organizationId))) {
    return validationError({
      serviceIds: ["Um ou mais servicos selecionados nao estao disponiveis."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .update({
      name: values.name,
      specialty: nullable(values.specialty),
      available_hours: nullable(values.availableHours),
      active: values.active,
    })
    .eq("id", professionalId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o profissional. Confira se ele ainda existe.",
    );
  }

  const synced = await syncProfessionalServices(
    supabase,
    professionalId,
    identity.organizationId,
    serviceIds,
  );

  if (!synced) {
    return databaseError(
      "Nao foi possivel atualizar os servicos vinculados. Tente novamente.",
    );
  }

  revalidatePath("/agenda/profissionais");
  revalidatePath(`/agenda/profissionais/${professionalId}`);
  redirect(`/agenda/profissionais/${professionalId}?updated=1`);
}

export async function updateProfessionalActiveAction(
  professionalId: string,
  active: boolean,
) {
  const parsedId = professionalIdSchema.safeParse(professionalId);
  const parsedActive = z.boolean().safeParse(active);

  if (!parsedId.success || !parsedActive.success) {
    return { error: "Nao foi possivel identificar o profissional." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .update({ active: parsedActive.data })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar a situacao do profissional." };
  }

  revalidatePath("/agenda/profissionais");
  revalidatePath(`/agenda/profissionais/${professionalId}`);

  return { error: null };
}

export async function deleteProfessionalAction(professionalId: string) {
  if (!professionalIdSchema.safeParse(professionalId).success) {
    return { error: "Profissional invalido." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .delete()
    .eq("id", professionalId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir o profissional. Tente novamente." };
  }

  revalidatePath("/agenda/profissionais");
  redirect("/agenda/profissionais?deleted=1");
}
