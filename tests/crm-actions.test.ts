import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCustomerAction } from "@/features/crm/customers/actions";
import { initialCustomerFormState } from "@/features/crm/customers/types";
import {
  createLeadAction,
  moveLeadStageAction,
} from "@/features/crm/leads/actions";
import { initialLeadFormState } from "@/features/crm/leads/types";
import { createProposalAction } from "@/features/propostas/actions";
import { initialProposalFormState } from "@/features/propostas/types";
import { createTaskAction } from "@/features/tarefas/actions";
import { initialTaskFormState } from "@/features/tarefas/types";
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
const userId = "00000000-0000-4000-8000-000000000002";
const customerId = "00000000-0000-4000-8000-000000000003";
const leadId = "00000000-0000-4000-8000-000000000004";
const taskId = "00000000-0000-4000-8000-000000000005";
const proposalId = "00000000-0000-4000-8000-000000000006";

const identity = {
  userId,
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

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

function createInsertClient(id: string) {
  const single = vi.fn().mockResolvedValue({
    data: { id },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });

  return {
    client: { from },
    from,
    insert,
    select,
    single,
  };
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

  return {
    client: { from },
    from,
    select,
    idEq,
    organizationEq,
    maybeSingle,
  };
}

function createUpdateClient(id: string) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { id },
    error: null,
  });
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const organizationEq = vi.fn().mockReturnValue({ select });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const update = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ update });

  return {
    client: { from },
    from,
    update,
    idEq,
    organizationEq,
    select,
    maybeSingle,
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

describe("fluxos principais do CRM", () => {
  it("cria um cliente vinculado a organizacao atual", async () => {
    const database = createInsertClient(customerId);
    queueClient(database.client);

    await createCustomerAction(
      initialCustomerFormState,
      formData({
        name: "Cliente Teste",
        company: "Empresa Cliente",
        phone: "(31) 3333-4444",
        whatsapp: "(31) 99999-8888",
        email: "CONTATO@CLIENTE.COM.BR",
        segment: "Consultoria",
        notes: "Prefere contato por WhatsApp.",
        status: "active",
      }),
    );

    expect(database.from).toHaveBeenCalledWith("customers");
    expect(database.insert).toHaveBeenCalledWith({
      organization_id: organizationId,
      name: "Cliente Teste",
      company: "Empresa Cliente",
      phone: "(31) 3333-4444",
      whatsapp: "(31) 99999-8888",
      email: "contato@cliente.com.br",
      segment: "Consultoria",
      notes: "Prefere contato por WhatsApp.",
      status: "active",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/crm");
    expect(redirectMock).toHaveBeenCalledWith(
      `/crm/${customerId}?created=1`,
    );
  });

  it("cria um lead com responsavel e valor estimado", async () => {
    const database = createInsertClient(leadId);
    queueClient(database.client);

    await createLeadAction(
      initialLeadFormState,
      formData({
        name: "Lead Teste",
        company: "Empresa Lead",
        phone: "(31) 98888-7777",
        email: "COMERCIAL@LEAD.COM.BR",
        source: "Indicacao",
        status: "new",
        estimatedValue: "12500.50",
        notes: "Solicitou retorno na segunda-feira.",
      }),
    );

    expect(database.from).toHaveBeenCalledWith("leads");
    expect(database.insert).toHaveBeenCalledWith({
      organization_id: organizationId,
      owner_id: userId,
      name: "Lead Teste",
      company: "Empresa Lead",
      phone: "(31) 98888-7777",
      email: "comercial@lead.com.br",
      source: "Indicacao",
      status: "new",
      estimated_value: 12500.5,
      notes: "Solicitou retorno na segunda-feira.",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/crm/dashboard");
    expect(redirectMock).toHaveBeenCalledWith(`/crm/leads/${leadId}?created=1`);
  });

  it("move um lead para outra etapa do pipeline", async () => {
    const database = createUpdateClient(leadId);
    queueClient(database.client);

    const result = await moveLeadStageAction(leadId, "negotiation");

    expect(result).toEqual({ error: null });
    expect(database.from).toHaveBeenCalledWith("leads");
    expect(database.update).toHaveBeenCalledWith({
      status: "negotiation",
    });
    expect(database.idEq).toHaveBeenCalledWith("id", leadId);
    expect(database.organizationEq).toHaveBeenCalledWith(
      "organization_id",
      organizationId,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/crm/dashboard");
  });

  it("cria uma tarefa vinculada a um lead valido", async () => {
    const lookup = createLookupClient(leadId);
    const database = createInsertClient(taskId);
    queueClient(lookup.client);
    queueClient(database.client);

    await createTaskAction(
      initialTaskFormState,
      formData({
        title: "Retornar contato",
        description: "Confirmar escopo antes de enviar a proposta.",
        dueAt: "2026-06-15T14:30",
        priority: "high",
        status: "pending",
        relationship: `lead:${leadId}`,
      }),
    );

    expect(lookup.from).toHaveBeenCalledWith("leads");
    expect(lookup.idEq).toHaveBeenCalledWith("id", leadId);
    expect(lookup.organizationEq).toHaveBeenCalledWith(
      "organization_id",
      organizationId,
    );
    expect(database.from).toHaveBeenCalledWith("tasks");
    expect(database.insert).toHaveBeenCalledWith({
      organization_id: organizationId,
      assignee_id: userId,
      customer_id: null,
      lead_id: leadId,
      title: "Retornar contato",
      description: "Confirmar escopo antes de enviar a proposta.",
      due_at: "2026-06-15T17:30:00.000Z",
      priority: "high",
      status: "pending",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/crm/dashboard");
    expect(redirectMock).toHaveBeenCalledWith(`/tarefas/${taskId}?created=1`);
  });

  it("cria uma proposta apenas para um cliente da organizacao", async () => {
    const lookup = createLookupClient(customerId);
    const rpc = vi.fn().mockResolvedValue({ data: proposalId, error: null });
    queueClient(lookup.client);
    queueClient({ rpc });

    await createProposalAction(
      initialProposalFormState,
      formData({
        title: "Projeto de implantacao",
        customerId,
        services: "Diagnostico, configuracao e treinamento.",
        value: "18900",
        validUntil: "2026-06-30",
        status: "sent",
        notes: "Pagamento em duas parcelas.",
      }),
    );

    expect(lookup.from).toHaveBeenCalledWith("customers");
    expect(lookup.idEq).toHaveBeenCalledWith("id", customerId);
    expect(lookup.organizationEq).toHaveBeenCalledWith(
      "organization_id",
      organizationId,
    );
    expect(rpc).toHaveBeenCalledWith("save_simple_proposal", {
      p_customer_id: customerId,
      p_proposal_id: null,
      p_proposal_notes: "Pagamento em duas parcelas.",
      p_proposal_status: "sent",
      p_proposal_title: "Projeto de implantacao",
      p_proposal_value: 18900,
      p_service_description: "Diagnostico, configuracao e treinamento.",
      p_valid_until_date: "2026-06-30",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/crm/dashboard");
    expect(redirectMock).toHaveBeenCalledWith(
      `/propostas/${proposalId}?created=1`,
    );
  });
});
