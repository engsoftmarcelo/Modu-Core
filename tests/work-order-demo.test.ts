import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prepareWorkOrderDemoAction } from "@/features/ordens-servico/demo/actions";
import { workOrderDemoCustomer } from "@/features/ordens-servico/demo/defaults";
import { resolveWorkOrderDemoProgress } from "@/features/ordens-servico/demo/work-order-demo-progress";
import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getWorkspaceIdentity: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const organizationId = "00000000-0000-4000-8000-000000000001";
const customerId = "00000000-0000-4000-8000-000000000601";

const createClientMock = vi.mocked(createClient);
const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const redirectMock = vi.mocked(redirect);
const revalidatePathMock = vi.mocked(revalidatePath);

beforeEach(() => {
  createClientMock.mockReset();
  getWorkspaceIdentityMock.mockReset();
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  getWorkspaceIdentityMock.mockResolvedValue({
    email: "dono@empresa.com.br",
    fullName: "Dono da Empresa",
    organizationId,
    organizationName: "Servicos Demo",
    userId: "00000000-0000-4000-8000-000000000002",
  });
});

describe("demo de ordens de servico", () => {
  it("reutiliza o cliente preparado e abre a solicitacao preenchida", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: customerId },
      error: null,
    });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const emailEq = vi.fn().mockReturnValue({ limit });
    const organizationEq = vi.fn().mockReturnValue({ eq: emailEq });
    const select = vi.fn().mockReturnValue({ eq: organizationEq });
    const from = vi.fn().mockReturnValue({ select });
    createClientMock.mockResolvedValue(
      { from } as unknown as Awaited<ReturnType<typeof createClient>>,
    );

    await prepareWorkOrderDemoAction();

    expect(from).toHaveBeenCalledWith("customers");
    expect(emailEq).toHaveBeenCalledWith("email", workOrderDemoCustomer.email);
    expect(redirectMock).toHaveBeenCalledWith(
      `/ordens-servico/novo?demo=1&customerId=${customerId}`,
    );
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("avanca o roteiro conforme o estado real da ordem", () => {
    expect(
      resolveWorkOrderDemoProgress({
        attachmentCount: 0,
        quotedAt: null,
        status: "requested",
      }),
    ).toEqual({ completed: false, currentStep: 2 });

    expect(
      resolveWorkOrderDemoProgress({
        attachmentCount: 0,
        quotedAt: "2026-07-14T12:00:00.000Z",
        status: "quoted",
      }),
    ).toEqual({ completed: false, currentStep: 3 });

    expect(
      resolveWorkOrderDemoProgress({
        attachmentCount: 0,
        quotedAt: "2026-07-14T12:00:00.000Z",
        status: "approved",
      }),
    ).toEqual({ completed: false, currentStep: 4 });

    expect(
      resolveWorkOrderDemoProgress({
        attachmentCount: 0,
        quotedAt: "2026-07-14T12:00:00.000Z",
        status: "in_progress",
      }),
    ).toEqual({ completed: false, currentStep: 5 });

    expect(
      resolveWorkOrderDemoProgress({
        attachmentCount: 1,
        quotedAt: "2026-07-14T12:00:00.000Z",
        status: "in_progress",
      }),
    ).toEqual({ completed: false, currentStep: 6 });

    expect(
      resolveWorkOrderDemoProgress({
        attachmentCount: 1,
        quotedAt: "2026-07-14T12:00:00.000Z",
        status: "completed",
      }),
    ).toEqual({ completed: true, currentStep: 6 });
  });
});
