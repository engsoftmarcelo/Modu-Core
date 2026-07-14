import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeedbackMessage } from "@/components/ui/feedback-message";
import { PageLoading } from "@/components/ui/page-loading";
import { RouteError } from "@/components/ui/route-error";

describe("FeedbackMessage", () => {
  it("anuncia sucesso sem interromper a navegacao", () => {
    render(
      <FeedbackMessage tone="success">
        Cliente cadastrado com sucesso.
      </FeedbackMessage>,
    );

    const feedback = screen.getByRole("status");

    expect(feedback.textContent).toContain("Cliente cadastrado com sucesso.");
    expect(feedback.getAttribute("aria-live")).toBe("polite");
  });

  it("anuncia erros de forma assertiva", () => {
    render(
      <FeedbackMessage tone="error">Erro ao salvar dados.</FeedbackMessage>,
    );

    const feedback = screen.getByRole("alert");

    expect(feedback.textContent).toContain("Erro ao salvar dados.");
    expect(feedback.getAttribute("aria-live")).toBe("assertive");
  });
});

describe("PageLoading", () => {
  it("informa que os dados estao sendo carregados", () => {
    render(<PageLoading />);

    const loading = screen.getByRole("status");

    expect(loading.textContent).toContain("Carregando dados...");
    expect(loading.getAttribute("aria-busy")).toBe("true");
  });
});

describe("RouteError", () => {
  it("permite tentar novamente sem expor o erro tecnico", () => {
    const reset = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <RouteError
        error={new Error("Falha interna do banco")}
        reset={reset}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Erro ao carregar dados" }),
    ).toBeTruthy();
    expect(screen.queryByText("Falha interna do banco")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Voltar ao inicio" }).getAttribute("href"),
    ).toBe("/inicio");

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(reset).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
