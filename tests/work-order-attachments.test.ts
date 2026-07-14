import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeWorkOrderAttachmentUploadAction,
  deleteWorkOrderAttachmentAction,
  prepareWorkOrderAttachmentUploadAction,
} from "@/features/ordens-servico/attachment-actions";
import { workOrderAttachmentFileSchema } from "@/features/ordens-servico/schema";
import {
  workOrderAttachmentBucket,
  workOrderAttachmentMaxBytes,
} from "@/features/ordens-servico/types";
import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getWorkspaceIdentity: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const organizationId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const workOrderId = "00000000-0000-4000-8000-000000000502";
const attachmentId = "00000000-0000-4000-8000-000000000503";
const storagePath = `${organizationId}/${workOrderId}/${attachmentId}.jpg`;

const createClientMock = vi.mocked(createClient);
const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const revalidatePathMock = vi.mocked(revalidatePath);

function queueClient(client: unknown) {
  createClientMock.mockResolvedValue(
    client as Awaited<ReturnType<typeof createClient>>,
  );
}

function createThreeEqLookup(data: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  const organizationEq = vi.fn().mockReturnValue({ maybeSingle });
  const workOrderEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const idEq = vi.fn().mockReturnValue({ eq: workOrderEq });
  const select = vi.fn().mockReturnValue({ eq: idEq });

  return { maybeSingle, select };
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
    userId,
  });
});

describe("anexos de ordem de servico", () => {
  it("aceita imagens suportadas e rejeita PDF ou arquivo acima de 5 MB", () => {
    expect(
      workOrderAttachmentFileSchema.safeParse({
        fileName: "antes-do-servico.jpg",
        fileSize: 480_000,
        mimeType: "image/jpeg",
      }).success,
    ).toBe(true);

    expect(
      workOrderAttachmentFileSchema.safeParse({
        fileName: "laudo.pdf",
        fileSize: 480_000,
        mimeType: "application/pdf",
      }).success,
    ).toBe(false);

    expect(
      workOrderAttachmentFileSchema.safeParse({
        fileName: "foto-grande.png",
        fileSize: workOrderAttachmentMaxBytes + 1,
        mimeType: "image/png",
      }).success,
    ).toBe(false);
  });

  it("prepara metadados e uma URL assinada dentro da organizacao e da O.S.", async () => {
    const workOrderMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: workOrderId },
      error: null,
    });
    const workOrderOrganizationEq = vi
      .fn()
      .mockReturnValue({ maybeSingle: workOrderMaybeSingle });
    const workOrderIdEq = vi
      .fn()
      .mockReturnValue({ eq: workOrderOrganizationEq });
    const workOrderSelect = vi.fn().mockReturnValue({ eq: workOrderIdEq });

    const countOrganizationEq = vi
      .fn()
      .mockResolvedValue({ count: 2, error: null });
    const countWorkOrderEq = vi
      .fn()
      .mockReturnValue({ eq: countOrganizationEq });
    const countSelect = vi.fn().mockReturnValue({ eq: countWorkOrderEq });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: workOrderSelect })
      .mockReturnValueOnce({ select: countSelect })
      .mockReturnValueOnce({ insert });

    const createSignedUploadUrl = vi.fn().mockImplementation((path: string) =>
      Promise.resolve({
        data: { path, signedUrl: "https://storage.test/upload", token: "token" },
        error: null,
      }),
    );
    const storageFrom = vi.fn().mockReturnValue({ createSignedUploadUrl });

    queueClient({ from, storage: { from: storageFrom } });

    const result = await prepareWorkOrderAttachmentUploadAction(workOrderId, {
      fileName: "painel-antes.jpg",
      fileSize: 350_000,
      mimeType: "image/jpeg",
    });

    expect(result.error).toBeNull();
    expect(result.upload?.token).toBe("token");
    expect(result.upload?.path).toMatch(
      new RegExp(`^${organizationId}/${workOrderId}/[0-9a-f-]+\\.jpg$`),
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        file_name: "painel-antes.jpg",
        file_size: 350_000,
        mime_type: "image/jpeg",
        organization_id: organizationId,
        upload_status: "pending",
        uploaded_by: userId,
        work_order_id: workOrderId,
      }),
    );
    expect(storageFrom).toHaveBeenCalledWith(workOrderAttachmentBucket);
  });

  it("confirma o anexo somente depois que o objeto existe no Storage", async () => {
    const lookup = createThreeEqLookup({
      id: attachmentId,
      storage_path: storagePath,
      upload_status: "pending",
    });

    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: attachmentId },
      error: null,
    });
    const updateSelect = vi.fn().mockReturnValue({
      maybeSingle: updateMaybeSingle,
    });
    const updateOrganizationEq = vi.fn().mockReturnValue({
      select: updateSelect,
    });
    const updateWorkOrderEq = vi.fn().mockReturnValue({
      eq: updateOrganizationEq,
    });
    const updateIdEq = vi.fn().mockReturnValue({ eq: updateWorkOrderEq });
    const update = vi.fn().mockReturnValue({ eq: updateIdEq });
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: lookup.select })
      .mockReturnValueOnce({ update });

    const exists = vi.fn().mockResolvedValue({ data: true, error: null });
    const storageFrom = vi.fn().mockReturnValue({ exists });
    queueClient({ from, storage: { from: storageFrom } });

    await expect(
      completeWorkOrderAttachmentUploadAction(workOrderId, attachmentId),
    ).resolves.toEqual({ error: null });

    expect(exists).toHaveBeenCalledWith(storagePath);
    expect(update).toHaveBeenCalledWith({ upload_status: "ready" });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/ordens-servico/${workOrderId}`,
    );
  });

  it("remove o objeto do Storage antes de apagar o vinculo", async () => {
    const lookup = createThreeEqLookup({
      id: attachmentId,
      storage_path: storagePath,
    });

    const deleteMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: attachmentId },
      error: null,
    });
    const deleteSelect = vi.fn().mockReturnValue({
      maybeSingle: deleteMaybeSingle,
    });
    const deleteOrganizationEq = vi.fn().mockReturnValue({
      select: deleteSelect,
    });
    const deleteWorkOrderEq = vi.fn().mockReturnValue({
      eq: deleteOrganizationEq,
    });
    const deleteIdEq = vi.fn().mockReturnValue({ eq: deleteWorkOrderEq });
    const deleteRow = vi.fn().mockReturnValue({ eq: deleteIdEq });
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: lookup.select })
      .mockReturnValueOnce({ delete: deleteRow });

    const remove = vi.fn().mockResolvedValue({ data: [], error: null });
    const storageFrom = vi.fn().mockReturnValue({ remove });
    queueClient({ from, storage: { from: storageFrom } });

    await expect(
      deleteWorkOrderAttachmentAction(workOrderId, attachmentId),
    ).resolves.toEqual({ error: null });

    expect(remove).toHaveBeenCalledWith([storagePath]);
    expect(deleteRow).toHaveBeenCalledAfter(remove);
  });
});
