import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveWorkOrderQuoteAction } from "@/features/ordens-servico/actions";
import { parseWorkOrderQuoteForm } from "@/features/ordens-servico/schema";
import {
  calculateWorkOrderQuoteTotal,
  initialWorkOrderQuoteFormState,
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
const workOrderId = "00000000-0000-4000-8000-000000000502";

const createClientMock = vi.mocked(createClient);
const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const revalidatePathMock = vi.mocked(revalidatePath);

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => data.set(key, value));

  return data;
}

function createQuoteClient(status: WorkOrderStatus, quotedAt: string | null) {
  const lookupMaybeSingle = vi.fn().mockResolvedValue({
    data: { id: workOrderId, status, quoted_at: quotedAt },
    error: null,
  });
  const lookupOrganizationEq = vi.fn().mockReturnValue({
    maybeSingle: lookupMaybeSingle,
  });
  const lookupIdEq = vi.fn().mockReturnValue({ eq: lookupOrganizationEq });
  const lookupSelect = vi.fn().mockReturnValue({ eq: lookupIdEq });

  const updateMaybeSingle = vi.fn().mockResolvedValue({
    data: { id: workOrderId },
    error: null,
  });
  const updateSelect = vi.fn().mockReturnValue({
    maybeSingle: updateMaybeSingle,
  });
  const updateOrganizationEq = vi.fn().mockReturnValue({
    select: updateSelect,
  });
  const updateIdEq = vi.fn().mockReturnValue({ eq: updateOrganizationEq });
  const update = vi.fn().mockReturnValue({ eq: updateIdEq });
  const from = vi
    .fn()
    .mockReturnValueOnce({ select: lookupSelect })
    .mockReturnValueOnce({ update });

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

describe("orcamento de ordem de servico", () => {
  it("valida valores, desconto e prazo e calcula o total em centavos", () => {
    const parsed = parseWorkOrderQuoteForm(
      formData({
        materials: "1250.50",
        labor: "650",
        discount: "100.25",
        term: "5 dias uteis apos aprovacao",
      }),
    );

    expect(parsed.success).toBe(true);
    expect(calculateWorkOrderQuoteTotal(1250.5, 650, 100.25)).toBe(1800.25);
  });

  it("rejeita orcamento zerado, desconto maior que o subtotal e prazo vazio", () => {
    const parsed = parseWorkOrderQuoteForm(
      formData({
        materials: "0",
        labor: "0",
        discount: "10",
        term: "",
      }),
    );

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      expect(errors.materials).toContain(
        "Informe um valor de materiais ou mao de obra.",
      );
      expect(errors.discount).toContain(
        "O desconto nao pode superar materiais e mao de obra.",
      );
      expect(errors.term).toContain("Informe o prazo do servico.");
    }
  });

  it("salva o orcamento e move uma ordem solicitada para orcada", async () => {
    const quoteDatabase = createQuoteClient("requested", null);
    createClientMock.mockResolvedValue(
      quoteDatabase.client as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    await expect(
      saveWorkOrderQuoteAction(
        workOrderId,
        initialWorkOrderQuoteFormState,
        formData({
          materials: "800",
          labor: "500",
          discount: "100",
          term: "3 dias uteis",
        }),
      ),
    ).resolves.toEqual({
      status: "success",
      message: "Orcamento salvo com sucesso.",
      errors: {},
    });

    expect(quoteDatabase.from).toHaveBeenNthCalledWith(1, "work_orders");
    expect(quoteDatabase.from).toHaveBeenNthCalledWith(2, "work_orders");
    expect(quoteDatabase.update).toHaveBeenCalledWith({
      quote_materials: 800,
      quote_labor: 500,
      quote_discount: 100,
      quote_term: "3 dias uteis",
      quoted_at: expect.any(String),
      status: "quoted",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/ordens-servico/${workOrderId}`,
    );
  });

  it("preserva o status de uma ordem que ja foi aprovada", async () => {
    const quotedAt = "2026-07-13T12:00:00.000Z";
    const quoteDatabase = createQuoteClient("approved", quotedAt);
    createClientMock.mockResolvedValue(
      quoteDatabase.client as unknown as Awaited<
        ReturnType<typeof createClient>
      >,
    );

    await saveWorkOrderQuoteAction(
      workOrderId,
      initialWorkOrderQuoteFormState,
      formData({
        materials: "500",
        labor: "400",
        discount: "0",
        term: "2 dias uteis",
      }),
    );

    const payload = quoteDatabase.update.mock.calls[0]?.[0];
    expect(payload).toMatchObject({ quoted_at: quotedAt });
    expect(payload).not.toHaveProperty("status");
  });
});
