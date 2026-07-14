import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutDashboard } from "lucide-react";

import { ModuleCard } from "@/components/modules/module-card";
import { PageHeader } from "@/components/ui/page-header";
import { operationalModules } from "@/features/modules";
import { getWorkspaceIdentity } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function HomePage() {
  const identity = await getWorkspaceIdentity();
  const firstName = identity?.fullName.split(" ")[0] ?? "por aqui";

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Bom ter voce aqui, ${firstName}`}
        icon={LayoutDashboard}
        title="Central da operacao"
        description={`Escolha uma area para organizar a rotina da ${identity?.organizationName ?? "sua empresa"}.`}
        actions={[
          {
            href: "/dashboard",
            icon: ArrowRight,
            label: "Abrir dashboard",
          },
        ]}
      />

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-950">Areas de trabalho</h2>
            <p className="mt-1 text-sm text-slate-500">
              Acesse os modulos disponiveis para sua operacao.
            </p>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">
            {operationalModules.length} areas preparadas
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {operationalModules.map((module) => (
            <ModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-y border-slate-200 bg-white px-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-bold text-ink-950">Checklist de configuracao</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Complete os pontos abaixo antes de colocar dados reais no sistema.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Conta criada",
              "Empresa vinculada",
              "RLS habilitado",
              "Modulos definidos",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"
              >
                <CheckCircle2 className="size-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/configuracoes"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-ink-950 transition-colors hover:border-brand-200 hover:bg-brand-50"
        >
          Abrir configuracoes
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
