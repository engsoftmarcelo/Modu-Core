import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/utils";

import { rangeInstants, type CalendarView } from "./calendar";
import type {
  Appointment,
  AppointmentOptions,
  AppointmentWithRelations,
} from "./types";

const appointmentColumns =
  "id, organization_id, customer_id, professional_id, service_id, title, starts_at, ends_at, status, location, notes, created_at, updated_at";

async function attachRelations(
  appointments: Appointment[],
  organizationId: string,
): Promise<AppointmentWithRelations[]> {
  const customerIds = [
    ...new Set(
      appointments.flatMap((item) => (item.customer_id ? [item.customer_id] : [])),
    ),
  ];
  const professionalIds = [
    ...new Set(
      appointments.flatMap((item) =>
        item.professional_id ? [item.professional_id] : [],
      ),
    ),
  ];
  const serviceIds = [
    ...new Set(
      appointments.flatMap((item) => (item.service_id ? [item.service_id] : [])),
    ),
  ];
  const supabase = await createClient();

  const [customersResult, professionalsResult, servicesResult] =
    await Promise.all([
      customerIds.length
        ? supabase
            .from("customers")
            .select("id, name")
            .eq("organization_id", organizationId)
            .in("id", customerIds)
        : Promise.resolve({ data: [], error: null }),
      professionalIds.length
        ? supabase
            .from("professionals")
            .select("id, name")
            .eq("organization_id", organizationId)
            .in("id", professionalIds)
        : Promise.resolve({ data: [], error: null }),
      serviceIds.length
        ? supabase
            .from("services")
            .select("id, name")
            .eq("organization_id", organizationId)
            .in("id", serviceIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (
    customersResult.error ||
    professionalsResult.error ||
    servicesResult.error
  ) {
    throw new Error("Nao foi possivel carregar os vinculos dos agendamentos.");
  }

  const customerNames = new Map(
    (customersResult.data ?? []).map((row) => [row.id, row.name]),
  );
  const professionalNames = new Map(
    (professionalsResult.data ?? []).map((row) => [row.id, row.name]),
  );
  const serviceNames = new Map(
    (servicesResult.data ?? []).map((row) => [row.id, row.name]),
  );

  return appointments.map((appointment) => ({
    ...appointment,
    customerName: appointment.customer_id
      ? customerNames.get(appointment.customer_id) ?? null
      : null,
    professionalName: appointment.professional_id
      ? professionalNames.get(appointment.professional_id) ?? null
      : null,
    serviceName: appointment.service_id
      ? serviceNames.get(appointment.service_id) ?? null
      : null,
  }));
}

export async function getAppointmentsInRange(
  view: CalendarView,
  dateKey: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { appointments: [] as AppointmentWithRelations[], days: [] as string[] };
  }

  const { days, startISO, endISO } = rangeInstants(view, dateKey);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .eq("organization_id", identity.organizationId)
    .gte("starts_at", startISO)
    .lt("starts_at", endISO)
    .order("starts_at", { ascending: true })
    .limit(500);

  if (error) {
    throw new Error(`Nao foi possivel carregar a agenda: ${error.message}`);
  }

  return {
    appointments: await attachRelations(data ?? [], identity.organizationId),
    days,
  };
}

export async function getAppointmentOptions(): Promise<AppointmentOptions> {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return { customers: [], professionals: [], services: [] };
  }

  const supabase = await createClient();
  const [customersResult, professionalsResult, servicesResult] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, company")
        .eq("organization_id", identity.organizationId)
        .order("name")
        .limit(200),
      supabase
        .from("professionals")
        .select("id, name, specialty, active")
        .eq("organization_id", identity.organizationId)
        .order("active", { ascending: false })
        .order("name")
        .limit(200),
      supabase
        .from("services")
        .select("id, name, duration_minutes, active")
        .eq("organization_id", identity.organizationId)
        .order("active", { ascending: false })
        .order("name")
        .limit(200),
    ]);

  if (
    customersResult.error ||
    professionalsResult.error ||
    servicesResult.error
  ) {
    throw new Error("Nao foi possivel carregar as opcoes do agendamento.");
  }

  return {
    customers: (customersResult.data ?? []).map((customer) => ({
      id: customer.id,
      label: customer.company
        ? `${customer.name} - ${customer.company}`
        : customer.name,
    })),
    professionals: (professionalsResult.data ?? []).map((professional) => ({
      id: professional.id,
      label: professional.active
        ? professional.specialty
          ? `${professional.name} - ${professional.specialty}`
          : professional.name
        : `${professional.name} (inativo)`,
    })),
    services: (servicesResult.data ?? []).map((service) => ({
      id: service.id,
      durationMinutes: service.duration_minutes,
      label: service.active
        ? `${service.name} (${formatDuration(service.duration_minutes)})`
        : `${service.name} (inativo)`,
    })),
  };
}

export const getAppointmentById = cache(async function getAppointmentById(
  appointmentId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .eq("id", appointmentId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o agendamento: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [appointment] = await attachRelations([data], identity.organizationId);
  return appointment;
});
