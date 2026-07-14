import type { Metadata } from "next";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  CircleAlert,
  ClipboardPlus,
  HardHat,
  PlayCircle,
  ReceiptText,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { workOrderDemoDefaults } from "@/features/ordens-servico/demo/defaults";
import { PrepareWorkOrderDemoButton } from "@/features/ordens-servico/demo/prepare-work-order-demo-button";

export const metadata: Metadata = { title: "Demo de ordens de servico" };

const demoSteps = [
  {
    description: "Cliente, endereco, problema relatado e visita.",
    icon: ClipboardPlus,
    label: "Cliente solicita servico",
  },
  {
    description: "Materiais, mao de obra, desconto, total e prazo.",
    icon: ReceiptText,
    label: "Empresa cria orcamento",
  },
  {
    description: "A proposta passa para o status Aprovada.",
    icon: BadgeCheck,
    label: "Orcamento aprovado",
  },
  {
    description: "Tecnico inicia a execucao e atualiza o checklist.",
    icon: HardHat,
    label: "Tecnico executa",
  },
  {
    description: "Registro visual do atendimento pelo celular.",
    icon: Camera,
    label: "Tecnico anexa fotos",
  },
  {
    description: "Nome, observacao, data, hora e aceite do cliente.",
    icon: UserCheck,
    label: "Cliente confirma conclusao",
  },
] as const;

type WorkOrderDemoPageProps = {
  searchParams: Promise<{ setup?: string }>;
};

export default async function WorkOrderDemoPage({
  searchParams,
}: WorkOrderDemoPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {params.setup === "error" ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <CircleAlert className="size-5 shrink-0" />
          Nao foi possivel preparar o cliente da demo. Tente novamente.
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">
            <PlayCircle className="mr-1.5 size-3.5" />
            Demo guiada
          </Badge>
          <h1 className="mt-4 text-3xl font-bold text-ink-950 sm:text-4xl">
            Demo de ordem de servico em 6 etapas
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Apresente o atendimento completo, da solicitacao ao aceite final.
          </p>
        </div>

        <PrepareWorkOrderDemoButton />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-ink-950">Fluxo da demonstracao</h2>
          </div>
          <ol className="divide-y divide-slate-100">
            {demoSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <li
                  key={step.label}
                  className="flex items-center gap-4 px-5 py-4 sm:px-6"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Etapa {index + 1}
                    </p>
                    <p className="mt-1 font-bold text-ink-950">{step.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="h-fit p-5 sm:p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-5" />
          </span>
          <h2 className="mt-4 font-bold text-ink-950">Cenario preparado</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-bold text-slate-500">Cliente</dt>
              <dd className="mt-1 font-semibold text-ink-950">
                Mariana Oliveira
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">Servico</dt>
              <dd className="mt-1 font-semibold leading-6 text-ink-950">
                {workOrderDemoDefaults.serviceType}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">Tecnico</dt>
              <dd className="mt-1 font-semibold text-ink-950">
                {workOrderDemoDefaults.technicianName}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
