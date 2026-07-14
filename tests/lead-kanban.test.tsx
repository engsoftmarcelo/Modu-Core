import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { moveLeadStageAction } from "@/features/crm/leads/actions";
import { LeadKanban } from "@/features/crm/leads/components/lead-kanban";
import type { Lead } from "@/features/crm/leads/types";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/crm/leads/actions", () => ({
  moveLeadStageAction: vi.fn(),
}));

const lead: Lead = {
  id: "00000000-0000-4000-8000-000000000004",
  organization_id: "00000000-0000-4000-8000-000000000001",
  owner_id: "00000000-0000-4000-8000-000000000002",
  name: "Lead do kanban",
  company: "Empresa Teste",
  email: "lead@empresa.com.br",
  phone: "(31) 99999-9999",
  source: "Indicacao",
  status: "new",
  estimated_value: 5000,
  notes: null,
  created_at: "2026-06-14T12:00:00.000Z",
  updated_at: "2026-06-14T12:00:00.000Z",
};

describe("LeadKanban", () => {
  it("mostra uma proxima acao quando o funil ainda esta vazio", () => {
    render(<LeadKanban leads={[]} />);

    expect(
      screen.getByRole("heading", { name: "Seu funil ainda esta vazio." }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Cadastrar primeiro lead" })
        .getAttribute("href"),
    ).toBe("/crm/leads/novo");
    expect(screen.queryByText("Solte um lead aqui")).toBeNull();
  });

  it("sincroniza o estado local quando o servidor devolve uma nova etapa", async () => {
    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    const { rerender } = render(<LeadKanban leads={[lead]} />);
    const initialSelect = screen.getByRole("combobox", {
      name: "Mover Lead do kanban para outra etapa",
    }) as HTMLSelectElement;

    expect(initialSelect.value).toBe("new");

    rerender(
      <LeadKanban
        leads={[
          {
            ...lead,
            status: "contacted",
            updated_at: "2026-06-14T12:05:00.000Z",
          },
        ]}
      />,
    );

    await waitFor(() => {
      const updatedSelect = screen.getByRole("combobox", {
        name: "Mover Lead do kanban para outra etapa",
      }) as HTMLSelectElement;

      expect(updatedSelect.value).toBe("contacted");
    });
  });

  it("confirma quando uma mudanca de etapa e salva", async () => {
    const refresh = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      refresh,
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    vi.mocked(moveLeadStageAction).mockResolvedValue({ error: null });

    render(<LeadKanban leads={[lead]} />);

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Mover Lead do kanban para outra etapa",
      }),
      { target: { value: "contacted" } },
    );

    const feedback = await screen.findByRole("status");

    expect(feedback.textContent).toContain("Lead movido com sucesso.");
    expect(moveLeadStageAction).toHaveBeenCalledWith(lead.id, "contacted");
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
