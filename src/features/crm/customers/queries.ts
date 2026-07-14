import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { Customer, CustomerStatus } from "./types";

type CustomerHistoryAppointment = {
  id: string;
  title: string;
  starts_at: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  professionalName: string | null;
  serviceName: string | null;
};

export type CustomerServiceHistoryItem = {
  name: string;
  count: number;
  lastDoneAt: string;
};

export type CustomerHistory = {
  pastAppointments: CustomerHistoryAppointment[];
  servicesDone: CustomerServiceHistoryItem[];
  appointmentNotes: string[];
  nextReturn: CustomerHistoryAppointment | null;
};

export type CustomerListFilters = {
  query?: string;
  status?: CustomerStatus | "all";
};

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

export async function getCustomers(filters: CustomerListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { customers: [] as Customer[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select(
      "id, organization_id, name, company, phone, whatsapp, email, segment, document, notes, status, created_at, updated_at",
      { count: "exact" },
    )
    .eq("organization_id", identity.organizationId)
    .order("name")
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      [
        `name.ilike.%${searchTerm}%`,
        `company.ilike.%${searchTerm}%`,
        `email.ilike.%${searchTerm}%`,
        `phone.ilike.%${searchTerm}%`,
        `whatsapp.ilike.%${searchTerm}%`,
        `segment.ilike.%${searchTerm}%`,
      ].join(","),
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar os clientes: ${error.message}`);
  }

  return {
    customers: data ?? [],
    count: count ?? 0,
  };
}

export const getCustomerById = cache(async function getCustomerById(
  customerId: string,
) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, organization_id, name, company, phone, whatsapp, email, segment, document, notes, status, created_at, updated_at",
    )
    .eq("id", customerId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar o cliente: ${error.message}`);
  }

  return data;
});

const historyAppointmentColumns =
  "id, customer_id, professional_id, service_id, title, starts_at, status, notes";

async function attachCustomerHistoryRelations(
  appointments: {
    id: string;
    customer_id: string | null;
    professional_id: string | null;
    service_id: string | null;
    title: string;
    starts_at: string;
    status: "scheduled" | "confirmed" | "completed" | "cancelled";
    notes: string | null;
  }[],
  organizationId: string,
): Promise<CustomerHistoryAppointment[]> {
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

  const [professionalsResult, servicesResult] = await Promise.all([
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

  if (professionalsResult.error || servicesResult.error) {
    throw new Error("Nao foi possivel carregar os vinculos do historico.");
  }

  const professionalNames = new Map(
    (professionalsResult.data ?? []).map((row) => [row.id, row.name]),
  );
  const serviceNames = new Map(
    (servicesResult.data ?? []).map((row) => [row.id, row.name]),
  );

  return appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    starts_at: appointment.starts_at,
    status: appointment.status,
    notes: appointment.notes,
    professionalName: appointment.professional_id
      ? professionalNames.get(appointment.professional_id) ?? null
      : null,
    serviceName: appointment.service_id
      ? serviceNames.get(appointment.service_id) ?? null
      : null,
  }));
}

export const getCustomerHistory = cache(async function getCustomerHistory(
  customerId: string,
): Promise<CustomerHistory> {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return {
      pastAppointments: [],
      servicesDone: [],
      appointmentNotes: [],
      nextReturn: null,
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const [pastResult, nextResult, completedResult] = await Promise.all([
    supabase
      .from("appointments")
      .select(historyAppointmentColumns)
      .eq("organization_id", identity.organizationId)
      .eq("customer_id", customerId)
      .lt("starts_at", now)
      .order("starts_at", { ascending: false })
      .limit(8),
    supabase
      .from("appointments")
      .select(historyAppointmentColumns)
      .eq("organization_id", identity.organizationId)
      .eq("customer_id", customerId)
      .gte("starts_at", now)
      .neq("status", "cancelled")
      .order("starts_at", { ascending: true })
      .limit(1),
    supabase
      .from("appointments")
      .select(historyAppointmentColumns)
      .eq("organization_id", identity.organizationId)
      .eq("customer_id", customerId)
      .eq("status", "completed")
      .lt("starts_at", now)
      .order("starts_at", { ascending: false })
      .limit(100),
  ]);

  if (pastResult.error || nextResult.error || completedResult.error) {
    throw new Error("Nao foi possivel carregar o historico do cliente.");
  }

  const [pastAppointments, nextAppointments, completedAppointments] =
    await Promise.all([
      attachCustomerHistoryRelations(pastResult.data ?? [], identity.organizationId),
      attachCustomerHistoryRelations(nextResult.data ?? [], identity.organizationId),
      attachCustomerHistoryRelations(
        completedResult.data ?? [],
        identity.organizationId,
      ),
    ]);

  const servicesDoneByName = new Map<string, CustomerServiceHistoryItem>();

  completedAppointments.forEach((appointment) => {
    const name = appointment.serviceName ?? appointment.title;
    const current = servicesDoneByName.get(name);

    if (current) {
      servicesDoneByName.set(name, {
        ...current,
        count: current.count + 1,
      });
      return;
    }

    servicesDoneByName.set(name, {
      name,
      count: 1,
      lastDoneAt: appointment.starts_at,
    });
  });

  const appointmentNotes = pastAppointments
    .map((appointment) => appointment.notes?.trim())
    .filter((note): note is string => Boolean(note))
    .slice(0, 4);

  return {
    pastAppointments,
    servicesDone: [...servicesDoneByName.values()],
    appointmentNotes,
    nextReturn: nextAppointments[0] ?? null,
  };
});
