import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProfessionalAction } from "@/features/agenda/profissionais/actions";
import { initialProfessionalFormState } from "@/features/agenda/profissionais/types";
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
const professionalId = "00000000-0000-4000-8000-000000000011";
const serviceIdA = "00000000-0000-4000-8000-000000000012";
const serviceIdB = "00000000-0000-4000-8000-000000000013";

const identity = {
  userId: "00000000-0000-4000-8000-000000000002",
  email: "dono@empresa.com.br",
  fullName: "Dono da Empresa",
  organizationId,
  organizationName: "Empresa BH",
  role: "owner" as const,
};

const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const createClientMock = vi.mocked(createClient);
const revalidatePathMock = vi.mocked(revalidatePath);
const redirectMock = vi.mocked(redirect);

function formData(values: Record<string, string | string[]>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    const valuesToAppend = Array.isArray(value) ? value : [value];
    valuesToAppend.forEach((item) => data.append(key, item));
  });

  return data;
}

function createServiceLookupClient(serviceIds: string[]) {
  const inMock = vi.fn().mockResolvedValue({
    data: serviceIds.map((id) => ({ id })),
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ in: inMock });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from },
    from,
    eq,
    inMock,
  };
}

function createProfessionalMutationClient() {
  const single = vi.fn().mockResolvedValue({
    data: { id: professionalId },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ single });
  const insertProfessional = vi.fn().mockReturnValue({ select });

  const deleteOrganizationEq = vi.fn().mockResolvedValue({ error: null });
  const deleteProfessionalEq = vi.fn().mockReturnValue({
    eq: deleteOrganizationEq,
  });
  const deleteLinks = vi.fn().mockReturnValue({ eq: deleteProfessionalEq });
  const insertLinks = vi.fn().mockResolvedValue({ error: null });

  const from = vi.fn((table: string) => {
    if (table === "professionals") {
      return { insert: insertProfessional };
    }

    return {
      delete: deleteLinks,
      insert: insertLinks,
    };
  });

  return {
    client: { from },
    from,
    insertProfessional,
    deleteProfessionalEq,
    deleteOrganizationEq,
    insertLinks,
  };
}

function queueClient(client: unknown) {
  createClientMock.mockResolvedValueOnce(
    client as Awaited<ReturnType<typeof createClient>>,
  );
}

beforeEach(() => {
  createClientMock.mockReset();
  getWorkspaceIdentityMock.mockReset();
  getWorkspaceIdentityMock.mockResolvedValue(identity);
});

describe("fluxo de profissionais", () => {
  it("cria um profissional e vincula os servicos da organizacao", async () => {
    const lookup = createServiceLookupClient([serviceIdA, serviceIdB]);
    const database = createProfessionalMutationClient();
    queueClient(lookup.client);
    queueClient(database.client);

    await createProfessionalAction(
      initialProfessionalFormState,
      formData({
        name: "Ana Profissional",
        specialty: "Estetica facial",
        availableHours: "Seg a Sex, 9h as 18h\nSab, 9h as 13h",
        active: "active",
        serviceIds: [serviceIdA, serviceIdB, serviceIdA],
      }),
    );

    expect(lookup.from).toHaveBeenCalledWith("services");
    expect(lookup.eq).toHaveBeenCalledWith("organization_id", organizationId);
    expect(lookup.inMock).toHaveBeenCalledWith("id", [
      serviceIdA,
      serviceIdB,
    ]);
    expect(database.from).toHaveBeenCalledWith("professionals");
    expect(database.insertProfessional).toHaveBeenCalledWith({
      organization_id: organizationId,
      name: "Ana Profissional",
      specialty: "Estetica facial",
      available_hours: "Seg a Sex, 9h as 18h\nSab, 9h as 13h",
      active: true,
    });
    expect(database.deleteProfessionalEq).toHaveBeenCalledWith(
      "professional_id",
      professionalId,
    );
    expect(database.deleteOrganizationEq).toHaveBeenCalledWith(
      "organization_id",
      organizationId,
    );
    expect(database.insertLinks).toHaveBeenCalledWith([
      {
        organization_id: organizationId,
        professional_id: professionalId,
        service_id: serviceIdA,
      },
      {
        organization_id: organizationId,
        professional_id: professionalId,
        service_id: serviceIdB,
      },
    ]);
    expect(revalidatePathMock).toHaveBeenCalledWith("/agenda/profissionais");
    expect(redirectMock).toHaveBeenCalledWith(
      `/agenda/profissionais/${professionalId}?created=1`,
    );
  });
});
