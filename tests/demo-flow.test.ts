import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAppointmentAction,
  updateAppointmentStatusAction,
} from "@/features/agenda/agendamentos/actions";
import { initialAppointmentFormState } from "@/features/agenda/agendamentos/types";
import {
  buildAppointmentMessages,
  buildWhatsappLink,
} from "@/features/agenda/agendamentos/whatsapp";
import { createServiceAction } from "@/features/agenda/servicos/actions";
import { initialServiceFormState } from "@/features/agenda/servicos/types";
import { createCustomerAction } from "@/features/crm/customers/actions";
import {
  getCustomerHistory,
  type CustomerHistory,
} from "@/features/crm/customers/queries";
import { initialCustomerFormState } from "@/features/crm/customers/types";
import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getWorkspaceIdentity: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const organizationId = "00000000-0000-4000-8000-000000000001";
const customerId = "00000000-0000-4000-8000-000000000021";
const serviceId = "00000000-0000-4000-8000-000000000022";
const appointmentId = "00000000-0000-4000-8000-000000000023";

const identity = {
  userId: "00000000-0000-4000-8000-000000000002",
  email: "dono@empresa.com.br",
  fullName: "Dono da Empresa",
  organizationId,
  organizationName: "Studio Demo",
  role: "owner" as const,
};

const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const createClientMock = vi.mocked(createClient);
const revalidatePathMock = vi.mocked(revalidatePath);
const redirectMock = vi.mocked(redirect);

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

function queueClient(client: unknown) {
  createClientMock.mockResolvedValueOnce(
    client as Awaited<ReturnType<typeof createClient>>,
  );
}

function createInsertClient(id: string) {
  const single = vi.fn().mockResolvedValue({
    data: { id },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });

  return { client: { from }, from, insert };
}

function createLookupClient(id: string) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { id },
    error: null,
  });
  const organizationEq = vi.fn().mockReturnValue({ maybeSingle });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const select = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ select });

  return { client: { from }, from, idEq, organizationEq };
}

function createAppointmentStatusClient() {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { id: appointmentId },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const organizationEq = vi.fn().mockReturnValue({ select });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const update = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ update });

  return { client: { from }, from, update, idEq, organizationEq };
}

function createAppointmentHistoryClient() {
  const completedAppointment = {
    id: appointmentId,
    customer_id: customerId,
    professional_id: null,
    service_id: serviceId,
    title: "Corte masculino",
    starts_at: "2026-06-12T13:00:00.000Z",
    status: "completed",
    notes: "Cliente compareceu e pediu retorno no proximo mes.",
  };
  const results = [
    { data: [completedAppointment], error: null },
    { data: [], error: null },
    { data: [completedAppointment], error: null },
  ];
  const limit = vi
    .fn()
    .mockImplementation(() => Promise.resolve(results.shift()));
  const order = vi.fn().mockReturnValue({ limit });
  const neq = vi.fn().mockReturnValue({ order });
  const gte = vi.fn().mockReturnValue({ neq });
  const lt = vi.fn().mockReturnValue({ order });
  const secondEq = vi.fn().mockReturnValue({ lt, gte, eq: vi.fn().mockReturnValue({ lt }) });
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  const select = vi.fn().mockReturnValue({ eq: firstEq });
  const from = vi.fn().mockReturnValue({ select });

  return { client: { from }, from };
}

function createServiceRelationClient() {
  const inMock = vi.fn().mockResolvedValue({
    data: [{ id: serviceId, name: "Corte masculino" }],
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ in: inMock });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn((table: string) => {
    if (table === "services") {
      return { select };
    }

    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    };
  });

  return { client: { from }, from };
}

beforeEach(() => {
  createClientMock.mockReset();
  getWorkspaceIdentityMock.mockReset();
  revalidatePathMock.mockReset();
  redirectMock.mockReset();
  getWorkspaceIdentityMock.mockResolvedValue(identity);
});

describe("demo completa", () => {
  it("cadastra cliente, servico, agendamento, confirma no WhatsApp, conclui e exibe historico", async () => {
    const customerDatabase = createInsertClient(customerId);
    queueClient(customerDatabase.client);

    await createCustomerAction(
      initialCustomerFormState,
      formData({
        name: "Marina Demo",
        company: "Cliente Particular",
        phone: "(31) 3333-4444",
        whatsapp: "(31) 99999-8888",
        email: "marina@example.com",
        segment: "Beleza",
        notes: "Prefere atendimento pela manha.",
        status: "active",
      }),
    );

    expect(customerDatabase.from).toHaveBeenCalledWith("customers");
    expect(redirectMock).toHaveBeenLastCalledWith(`/crm/${customerId}?created=1`);

    const serviceDatabase = createInsertClient(serviceId);
    queueClient(serviceDatabase.client);

    await createServiceAction(
      initialServiceFormState,
      formData({
        name: "Corte masculino",
        durationMinutes: "45",
        price: "80",
        description: "Corte com acabamento.",
        active: "active",
      }),
    );

    expect(serviceDatabase.from).toHaveBeenCalledWith("services");
    expect(redirectMock).toHaveBeenLastCalledWith(
      `/agenda/servicos/${serviceId}?created=1`,
    );

    const customerLookup = createLookupClient(customerId);
    const serviceLookup = createLookupClient(serviceId);
    const appointmentDatabase = createInsertClient(appointmentId);
    queueClient(customerLookup.client);
    queueClient(serviceLookup.client);
    queueClient(appointmentDatabase.client);

    await createAppointmentAction(
      initialAppointmentFormState,
      formData({
        title: "Corte masculino - Marina Demo",
        customerId,
        professionalId: "",
        serviceId,
        date: "2026-06-12",
        startTime: "10:00",
        durationMinutes: "45",
        status: "confirmed",
        location: "Sala 1",
        notes: "Primeira visita da cliente.",
      }),
    );

    expect(customerLookup.from).toHaveBeenCalledWith("customers");
    expect(serviceLookup.from).toHaveBeenCalledWith("services");
    expect(appointmentDatabase.from).toHaveBeenCalledWith("appointments");
    expect(redirectMock).toHaveBeenLastCalledWith(
      `/agenda/agendamentos/${appointmentId}?created=1`,
    );

    const [confirmation] = buildAppointmentMessages({
      customerName: "Marina Demo",
      serviceName: "Corte masculino",
      professionalName: null,
      dayLabel: "sexta-feira, 12 de junho",
      timeLabel: "10:00",
      businessName: "Studio Demo",
    });
    const whatsappLink = buildWhatsappLink("(31) 99999-8888", confirmation.text);

    expect(confirmation.key).toBe("confirmacao");
    expect(whatsappLink).toContain("https://wa.me/5531999998888?text=");
    expect(decodeURIComponent(whatsappLink ?? "")).toContain(
      "confirmando o seu horario de Corte masculino",
    );

    const statusDatabase = createAppointmentStatusClient();
    queueClient(statusDatabase.client);

    await expect(
      updateAppointmentStatusAction(appointmentId, "completed"),
    ).resolves.toEqual({ error: null });

    expect(statusDatabase.from).toHaveBeenCalledWith("appointments");
    expect(statusDatabase.update).toHaveBeenCalledWith({ status: "completed" });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/agenda/agendamentos/${appointmentId}`,
    );

    queueClient(createAppointmentHistoryClient().client);
    queueClient(createServiceRelationClient().client);
    queueClient(createServiceRelationClient().client);
    queueClient(createServiceRelationClient().client);

    const history: CustomerHistory = await getCustomerHistory(customerId);

    expect(history.pastAppointments).toHaveLength(1);
    expect(history.pastAppointments[0]).toMatchObject({
      id: appointmentId,
      status: "completed",
      serviceName: "Corte masculino",
    });
    expect(history.servicesDone).toEqual([
      {
        name: "Corte masculino",
        count: 1,
        lastDoneAt: "2026-06-12T13:00:00.000Z",
      },
    ]);
    expect(history.appointmentNotes).toEqual([
      "Cliente compareceu e pediu retorno no proximo mes.",
    ]);
    expect(history.nextReturn).toBeNull();
  });
});
