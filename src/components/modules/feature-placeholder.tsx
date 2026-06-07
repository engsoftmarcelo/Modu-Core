import { Check, CircleDot, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ModuleConfig } from "@/features/modules";

export function FeaturePlaceholder({ module }: { module: ModuleConfig }) {
  const Icon = module.icon;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone={module.accent}>Modulo preparado</Badge>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm">
              <Icon className="size-6" />
            </span>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
              {module.name}
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            {module.description}
          </p>
        </div>
        <Button disabled className="sm:min-w-44">
          <Plus className="size-5" />
          Novo registro
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <p className="font-bold text-ink-950">Proximas entregas deste modulo</p>
          <p className="mt-1 text-sm text-slate-500">
            A estrutura esta isolada e pronta para receber as regras do produto.
          </p>
        </div>
        <div className="grid gap-px bg-slate-200 md:grid-cols-3">
          {module.nextSteps.map((step, index) => (
            <div key={step} className="bg-white p-6">
              <div className="flex items-center gap-3">
                {index === 0 ? (
                  <CircleDot className="size-5 text-brand-600" />
                ) : (
                  <Check className="size-5 text-slate-300" />
                )}
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Etapa {index + 1}
                </span>
              </div>
              <p className="mt-5 font-semibold leading-6 text-ink-950">{step}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
