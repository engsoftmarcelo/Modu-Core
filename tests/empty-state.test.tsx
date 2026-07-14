import { render, screen } from "@testing-library/react";
import { UserRound } from "lucide-react";
import { describe, expect, it } from "vitest";

import { CollectionEmptyState } from "@/components/ui/empty-state";

const commonProps = {
  clearHref: "/crm",
  createHref: "/crm/novo",
  createLabel: "Cadastrar primeiro cliente",
  emptyDescription: "Cadastre seu primeiro cliente para comecar.",
  emptyTitle: "Voce ainda nao cadastrou nenhum cliente.",
  filteredDescription: "Revise os filtros e tente novamente.",
  filteredTitle: "Nenhum cliente corresponde a sua busca.",
  icon: UserRound,
  tone: "blue" as const,
};

describe("CollectionEmptyState", () => {
  it("orienta o primeiro cadastro com uma acao direta", () => {
    render(<CollectionEmptyState {...commonProps} />);

    expect(
      screen.getByRole("heading", {
        name: "Voce ainda nao cadastrou nenhum cliente.",
      }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Cadastrar primeiro cliente" })
        .getAttribute("href"),
    ).toBe("/crm/novo");
    expect(screen.queryByRole("link", { name: "Limpar filtros" })).toBeNull();
  });

  it("diferencia uma busca sem resultado e permite limpar os filtros", () => {
    render(<CollectionEmptyState {...commonProps} hasFilters />);

    expect(
      screen.getByRole("heading", {
        name: "Nenhum cliente corresponde a sua busca.",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Limpar filtros" }).getAttribute("href"),
    ).toBe("/crm");
    expect(
      screen
        .getByRole("link", { name: "Cadastrar primeiro cliente" })
        .getAttribute("href"),
    ).toBe("/crm/novo");
  });
});
