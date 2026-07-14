import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeWorkOrderAction,
  createWorkOrderAction,
  deleteWorkOrderAction,
  updateWorkOrderStatusAction,
} from "@/features/ordens-servico/actions";
import {
  initialWorkOrderFormState,
  type WorkOrderStatus,
} from "@/features/ordens-servico/types";
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
const customerId = "00000000-0000-4000-8000-000000000501";
const workOrderId = "00000000-0000-4000-8000-000000000502";

const identity = {
  email: "dono@empresa.com.br",
  fullName: "Dono da Empresa",
  organizationId,
  organizationName: "Servicos Demo",
  role: "owner" as const,
  userId: "00000000-0000-4000-8000-000000000002",
};

const createClientMock = vi.mocked(createClient);
const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const redirectMock = vi.mocked(redirect);
const revalidatePathMock = vi.mocked(revalidatePath);

function queueClient(client: unknown) {
  createClientMock.mockResolvedValueOnce(
    client as Awaited<ReturnType<typeof createClient>>,
  );
}

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => data.set(key, value));

  return data;
}

function createLookupClient(id: string) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { id }, error: null });
  const organizationEq = vi.fn().mockReturnValue({ maybeSingle });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const select = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ select });

  return { client: { from }, from };
}

function createInsertClient(id: string) {
  const single = vi.fn().mockResolvedValue({ data: { id }, error: null });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });

  return { client: { from }, from, insert };
}

function createUpdateClient(id: string) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { id }, error: null });
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const organizationEq = vi.fn().mockReturnValue({ select });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const update = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ update });

  return { client: { from }, from, update };
}

function createCompletionClient(completedAt: string) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { completed_at: completedAt, id: workOrderId },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const neq = vi.fn().mockReturnValue({ select });
  const organizationEq = vi.fn().mockReturnValue({ neq });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const update = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ update });

  return { client: { from }, from, neq, update };
}

beforeEach(() => {
  createClientMock.mockReset();
  getWorkspaceIdentityMock.mockReset();
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  getWorkspaceIdentityMock.mockResolvedValue(identity);
});

describe("acoes de ordens de servico", () => {
  it("valida o cliente e cria a ordem dentro da organizacao", async () => {
    const customerLookup = createLookupClient(customerId);
    const orderDatabase = createInsertClient(workOrderId);
    queueClient(customerLookup.client);
    queueClient(orderDatabase.client);

    await createWorkOrderAction(
      initialWorkOrderFormState,
      formData({
        address: "Rua das Flores, 120 - Centro",
        customerId,
        description: "Revisar instalacao e substituir componente danificado.",
        serviceType: "Manutencao eletrica",
        status: "requested",
        technicianName: "Carlos Lima",
        visitDate: "2026-07-20",
      }),
    );

    expect(customerLookup.from).toHaveBeenCalledWith("customers");
    expect(orderDatabase.from).toHaveBeenCalledWith("work_orders");
    expect(orderDatabase.insert).toHaveBeenCalledWith({
      address: "Rua das Flores, 120 - Centro",
      customer_id: customerId,
      description: "Revisar instalacao e substituir componente danificado.",
      organization_id: organizationId,
      service_type: "Manutencao eletrica",
      status: "requested",
      technician_name: "Carlos Lima",
      visit_date: "2026-07-20",
    });
    expect(redirectMock).toHaveBeenCalledWith(
      `/ordens-servico/${workOrderId}?created=1`,
    );
  });

  it("atualiza o status e rejeita valores fora do fluxo", async () => {
    const updateDatabase = createUpdateClient(workOrderId);
    queueClient(updateDatabase.client);

    await expect(
      updateWorkOrderStatusAction(workOrderId, "in_progress"),
    ).resolves.toEqual({ error: null });

    expect(updateDatabase.from).toHaveBeenCalledWith("work_orders");
    expect(updateDatabase.update).toHaveBeenCalledWith({
      completed_at: null,
      completion_accepted: false,
      completion_approved_by: null,
      completion_notes: null,
      status: "in_progress",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/ordens-servico/${workOrderId}`,
    );

    createClientMock.mockClear();
    await expect(
      updateWorkOrderStatusAction(
        workOrderId,
        "waiting" as WorkOrderStatus,
      ),
    ).resolves.toEqual({
      error: "Nao foi possivel identificar a ordem ou o status.",
    });
    expect(createClientMock).not.toHaveBeenCalled();

    await expect(
      updateWorkOrderStatusAction(workOrderId, "completed"),
    ).resolves.toEqual({
      error: "Use a confirmacao de conclusao para finalizar a ordem.",
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("conclui a ordem somente com nome e aceite registrados", async () => {
    const completedAt = "2026-07-14T15:30:00.000Z";
    const completionDatabase = createCompletionClient(completedAt);
    queueClient(completionDatabase.client);

    await expect(
      completeWorkOrderAction(workOrderId, {
        accepted: true,
        approvedBy: "  Mariana Oliveira  ",
        finalNotes: "  Equipamento testado e liberado.  ",
      }),
    ).resolves.toEqual({ completedAt, error: null, errors: {} });

    expect(completionDatabase.from).toHaveBeenCalledWith("work_orders");
    expect(completionDatabase.update).toHaveBeenCalledWith({
      completed_at: expect.any(String),
      completion_accepted: true,
      completion_approved_by: "Mariana Oliveira",
      completion_notes: "Equipamento testado e liberado.",
      status: "completed",
    });
    expect(completionDatabase.neq).toHaveBeenCalledWith(
      "status",
      "cancelled",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/ordens-servico/${workOrderId}`,
    );

    createClientMock.mockClear();
    await expect(
      completeWorkOrderAction(workOrderId, {
        accepted: false,
        approvedBy: "",
        finalNotes: "",
      }),
    ).resolves.toMatchObject({
      error: "Revise os dados da confirmacao.",
      errors: {
        accepted: ["Confirme o aceite da conclusao."],
        approvedBy: ["Informe o nome de quem aprovou."],
      },
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("remove os anexos do Storage antes de excluir a ordem", async () => {
    const storagePath = `${organizationId}/${workOrderId}/foto.png`;
    const attachmentOrganizationEq = vi.fn().mockResolvedValue({
      data: [{ storage_path: storagePath }],
      error: null,
    });
    const attachmentWorkOrderEq = vi.fn().mockReturnValue({
      eq: attachmentOrganizationEq,
    });
    const attachmentSelect = vi.fn().mockReturnValue({
      eq: attachmentWorkOrderEq,
    });

    const deleteMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: workOrderId },
      error: null,
    });
    const deleteSelect = vi.fn().mockReturnValue({
      maybeSingle: deleteMaybeSingle,
    });
    const deleteOrganizationEq = vi.fn().mockReturnValue({
      select: deleteSelect,
    });
    const deleteIdEq = vi.fn().mockReturnValue({
      eq: deleteOrganizationEq,
    });
    const deleteOrder = vi.fn().mockReturnValue({ eq: deleteIdEq });
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: attachmentSelect })
      .mockReturnValueOnce({ delete: deleteOrder });

    const remove = vi.fn().mockResolvedValue({ data: [], error: null });
    const storageFrom = vi.fn().mockReturnValue({ remove });
    queueClient({ from, storage: { from: storageFrom } });

    await deleteWorkOrderAction(workOrderId);

    expect(remove).toHaveBeenCalledWith([storagePath]);
    expect(deleteOrder).toHaveBeenCalledAfter(remove);
    expect(redirectMock).toHaveBeenCalledWith("/ordens-servico?deleted=1");
  });
});
