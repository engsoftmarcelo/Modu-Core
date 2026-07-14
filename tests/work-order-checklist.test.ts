import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateWorkOrderChecklistItemAction } from "@/features/ordens-servico/actions";
import {
  workOrderChecklistDefaults,
  type WorkOrderChecklistItemKey,
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
const workOrderId = "00000000-0000-4000-8000-000000000502";

const createClientMock = vi.mocked(createClient);
const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const revalidatePathMock = vi.mocked(revalidatePath);

function createChecklistClient() {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { id: "00000000-0000-4000-8000-000000000503" },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const itemKeyEq = vi.fn().mockReturnValue({ select });
  const organizationEq = vi.fn().mockReturnValue({ eq: itemKeyEq });
  const workOrderEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const update = vi.fn().mockReturnValue({ eq: workOrderEq });
  const from = vi.fn().mockReturnValue({ update });

  return { client: { from }, from, update };
}

beforeEach(() => {
  createClientMock.mockReset();
  getWorkspaceIdentityMock.mockReset();
  revalidatePathMock.mockReset();
  getWorkspaceIdentityMock.mockResolvedValue({
    email: "dono@empresa.com.br",
    fullName: "Dono da Empresa",
    organizationId,
    organizationName: "Servicos Demo",
    role: "owner",
    userId: "00000000-0000-4000-8000-000000000002",
  });
});

describe("checklist de ordem de servico", () => {
  it("mantem as seis etapas padrao na ordem operacional", () => {
    expect(workOrderChecklistDefaults.map((item) => item.label)).toEqual([
      "Chegou ao local",
      "Avaliou o problema",
      "Tirou fotos",
      "Executou o servico",
      "Cliente aprovou",
      "Finalizou",
    ]);
    expect(workOrderChecklistDefaults.map((item) => item.position)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("marca uma etapa com horario e escopo da organizacao", async () => {
    const database = createChecklistClient();
    createClientMock.mockResolvedValue(
      database.client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    const result = await updateWorkOrderChecklistItemAction(
      workOrderId,
      "arrived_on_site",
      true,
    );

    expect(result).toEqual({ completedAt: expect.any(String), error: null });
    expect(database.from).toHaveBeenCalledWith(
      "work_order_checklist_items",
    );
    expect(database.update).toHaveBeenCalledWith({
      completed: true,
      completed_at: expect.any(String),
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/ordens-servico/${workOrderId}`,
    );
  });

  it("remove o horario ao desmarcar uma etapa", async () => {
    const database = createChecklistClient();
    createClientMock.mockResolvedValue(
      database.client as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    await expect(
      updateWorkOrderChecklistItemAction(workOrderId, "took_photos", false),
    ).resolves.toEqual({ completedAt: null, error: null });

    expect(database.update).toHaveBeenCalledWith({
      completed: false,
      completed_at: null,
    });
  });

  it("rejeita uma etapa desconhecida antes de acessar o banco", async () => {
    await expect(
      updateWorkOrderChecklistItemAction(
        workOrderId,
        "unknown" as WorkOrderChecklistItemKey,
        true,
      ),
    ).resolves.toEqual({
      error: "Nao foi possivel identificar esta etapa do checklist.",
    });

    expect(getWorkspaceIdentityMock).not.toHaveBeenCalled();
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
