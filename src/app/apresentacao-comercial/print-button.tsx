"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-ink-950 transition hover:bg-brand-50 print:hidden"
    >
      <Printer className="size-4" />
      Salvar em PDF
    </button>
  );
}
