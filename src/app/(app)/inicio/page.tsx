import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { ModuleCard } from "@/components/modules/module-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { operationalModules } from "@/features/modules";
import { getWorkspaceIdentity } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function HomePage() {
  const identity = await getWorkspaceIdentity();
  const firstName = identity?.fullName.split(" ")[0] ?? "por aqui";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="absolute -right-16 -top-20 size-72 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-44 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <Badge className="border border-white/10 bg-white/10 text-brand-100">
            <Sparkles className="mr-1.5 size-3.5" />
            Base da operacao
          </Badge>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
            Bom ter voce aqui, {firstName}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            O nucleo do seu sistema esta pronto. Escolha um modulo para comecar
            a organizar a rotina da {identity?.organizationName ?? "sua empresa"}.
          </p>
          <Link
            href="/dashboard"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-ink-950 transition hover:bg-brand-50"
          >
            Ver dashboard
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600">
              Modulos
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-ink-950">
              Monte a operacao que voce precisa
            </h2>
          </div>
          <p className="hidden text-sm text-slate-400 sm:block">
            {operationalModules.length} areas preparadas
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {operationalModules.map((module) => (
            <ModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>

      <Card className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-bold text-ink-950">Checklist de configuracao</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Complete os pontos abaixo antes de colocar dados reais no sistema.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "Conta criada",
              "Empresa vinculada",
              "RLS habilitado",
              "Modulos definidos",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
              >
                <CheckCircle2 className="size-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/configuracoes"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-ink-950 transition hover:bg-slate-50"
        >
          Abrir configuracoes
          <ArrowRight className="size-4" />
        </Link>
      </Card>
    </div>
  );
}
