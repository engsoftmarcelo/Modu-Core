import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

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
});
