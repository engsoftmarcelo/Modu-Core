"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white bg-white px-5 text-sm font-bold text-ink-950 transition-colors hover:bg-brand-50 print:hidden"
    >
      <Printer className="size-4" />
      Salvar em PDF
    </button>
  );
}
