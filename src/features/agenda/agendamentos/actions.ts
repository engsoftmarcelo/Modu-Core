"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  nullable,
  parseAppointmentForm,
  toAppointmentInstants,
} from "./schema";
import {
  appointmentStatuses,
  type AppointmentFormState,
  type AppointmentStatus,
} from "./types";

type RelationTable = "customers" | "professionals" | "services";

const appointmentIdSchema = z.uuid();
const appointmentStatusSchema = z.enum(appointmentStatuses);

function validationError(
  errors: Partial<Record<string, string[]>>,
): AppointmentFormState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    errors,
  };
}

function databaseError(message: string): AppointmentFormState {
  return {
    status: "error",
    message,
    errors: {},
  };
}

async function relationBelongsToOrganization(
  table: RelationTable,
  id: string | null,
  organizationId: string,
) {
  if (!id) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function validateRelations(
  values: {
    customerId: string | null;
    professionalId: string | null;
    serviceId: string | null;
  },
  organizationId: string,
): Promise<AppointmentFormState | null> {
  const [validCustomer, validProfessional, validService] = await Promise.all([
    relationBelongsToOrganization("customers", values.customerId, organizationId),
    relationBelongsToOrganization(
      "professionals",
      values.professionalId,
      organizationId,
    ),
    relationBelongsToOrganization("services", values.serviceId, organizationId),
  ]);

  if (!validCustomer) {
    return validationError({ customerId: ["Cliente indisponivel."] });
  }
  if (!validProfessional) {
    return validationError({ professionalId: ["Profissional indisponivel."] });
  }
  if (!validService) {
    return validationError({ serviceId: ["Servico indisponivel."] });
  }

  return null;
}

export async function createAppointmentAction(
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const parsed = parseAppointmentForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const relationError = await validateRelations(values, identity.organizationId);

  if (relationError) {
    return relationError;
  }

  const { startsAt, endsAt } = toAppointmentInstants(
    values.date,
    values.startTime,
    values.durationMinutes,
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      organization_id: identity.organizationId,
      customer_id: values.customerId,
      professional_id: values.professionalId,
      service_id: values.serviceId,
      title: values.title,
      starts_at: startsAt,
      ends_at: endsAt,
      status: values.status,
      location: nullable(values.location),
      notes: nullable(values.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel criar o agendamento. Tente novamente em instantes.",
    );
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  redirect(`/agenda/agendamentos/${data.id}?created=1`);
}

export async function updateAppointmentAction(
  appointmentId: string,
  _previousState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  if (!appointmentIdSchema.safeParse(appointmentId).success) {
    return databaseError("Agendamento invalido.");
  }

  const parsed = parseAppointmentForm(formData);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return databaseError("Sua organizacao nao foi encontrada. Entre novamente.");
  }

  const values = parsed.data;
  const relationError = await validateRelations(values, identity.organizationId);

  if (relationError) {
    return relationError;
  }

  const { startsAt, endsAt } = toAppointmentInstants(
    values.date,
    values.startTime,
    values.durationMinutes,
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({
      customer_id: values.customerId,
      professional_id: values.professionalId,
      service_id: values.serviceId,
      title: values.title,
      starts_at: startsAt,
      ends_at: endsAt,
      status: values.status,
      location: nullable(values.location),
      notes: nullable(values.notes),
    })
    .eq("id", appointmentId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return databaseError(
      "Nao foi possivel atualizar o agendamento. Confira se ele ainda existe.",
    );
  }

  revalidatePath("/agenda");
  revalidatePath(`/agenda/agendamentos/${appointmentId}`);
  revalidatePath("/dashboard");
  redirect(`/agenda/agendamentos/${appointmentId}?updated=1`);
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const parsedId = appointmentIdSchema.safeParse(appointmentId);
  const parsedStatus = appointmentStatusSchema.safeParse(status);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Nao foi possivel identificar o agendamento ou o status." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel atualizar o status do agendamento." };
  }

  revalidatePath("/agenda");
  revalidatePath(`/agenda/agendamentos/${appointmentId}`);
  revalidatePath("/dashboard");

  return { error: null };
}

export async function deleteAppointmentAction(appointmentId: string) {
  if (!appointmentIdSchema.safeParse(appointmentId).success) {
    return { error: "Agendamento invalido." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { error: "Sua organizacao nao foi encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir o agendamento. Tente novamente." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  redirect("/agenda?deleted=1");
}
