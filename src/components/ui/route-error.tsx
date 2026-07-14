"use client";

import Link from "next/link";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    console.error("Erro ao carregar uma rota do ModuCore:", error);
  }, [error]);

  return (
    <section className="grid min-h-[60vh] place-items-center px-4 py-10">
      <div className="w-full max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-xl bg-red-50 text-red-700 ring-8 ring-red-100">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-7 text-2xl font-bold text-ink-950 sm:text-3xl">
          Erro ao carregar dados
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          Nao foi possivel abrir esta tela agora. Tente novamente sem perder o
          ponto em que estava.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="size-5" aria-hidden="true" />
            Tentar novamente
          </Button>
          <Link
            href="/inicio"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-ink-950 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:w-auto"
          >
            <Home className="size-5" aria-hidden="true" />
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
