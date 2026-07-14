import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  Plus,
  Send,
  Target,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { CrmMetricCard } from "@/features/crm/dashboard/crm-metric-card";
import { getCrmDashboardMetrics } from "@/features/crm/dashboard/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard do CRM" };

const quickActions = [
  {
    label: "Cadastrar cliente",
    description: "Adicionar uma empresa ou contato a base.",
    href: "/crm/novo",
    icon: UserPlus,
  },
  {
    label: "Criar lead",
    description: "Registrar uma nova oportunidade comercial.",
    href: "/crm/leads/novo",
    icon: Target,
  },
  {
    label: "Criar proposta",
    description: "Preparar valores e servicos para envio.",
    href: "/propostas/novo",
    icon: FilePlus2,
  },
  {
    label: "Criar follow-up",
    description: "Agendar o proximo contato ou pendencia.",
    href: "/tarefas/novo",
    icon: ListChecks,
  },
] as const;

export default async function CrmDashboardPage() {
  const metrics = await getCrmDashboardMetrics();

  const cards = [
    {
      label: "Leads novos",
      value: metrics.newLeads,
      helper: "Oportunidades aguardando o primeiro contato.",
      href: "/crm/leads?view=list&status=new",
      icon: Target,
      tone: "blue" as const,
    },
    {
      label: "Propostas enviadas",
      value: metrics.sentProposals,
      helper: "Propostas enviadas que ainda aguardam decisao.",
      href: "/propostas?status=sent",
      icon: Send,
      tone: "violet" as const,
    },
    {
      label: "Propostas fechadas",
      value: metrics.closedProposals,
      helper: "Propostas aceitas pelos clientes.",
      href: "/propostas?status=accepted",
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      label: "Valor em negociacao",
      value: formatCurrency(metrics.negotiationValue),
      helper: "Soma estimada dos leads na etapa Negociacao.",
      href: "/crm/leads?view=list&status=negotiation",
      icon: CircleDollarSign,
      tone: "amber" as const,
    },
    {
      label: "Tarefas pendentes",
      value: metrics.pendingTasks,
      helper: "Pendentes ou em andamento na operacao.",
      href: "/tarefas?status=open",
      icon: ListChecks,
      tone: "slate" as const,
    },
  ];

  return (
    <div className="space-y-7">
      <CrmTabs />

      <PageHeader
        eyebrow="Visao comercial"
        icon={LayoutDashboard}
        title="Dashboard do CRM"
        description="Acompanhe oportunidades, propostas e proximos passos em uma unica leitura."
        actions={[{ href: "/crm/leads/novo", icon: Plus, label: "Novo lead" }]}
      />

      <section aria-labelledby="crm-indicators-title">
        <div className="mb-4">
          <h2 id="crm-indicators-title" className="font-bold text-ink-950">
            Indicadores atuais
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Clique em um indicador para abrir os registros correspondentes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <CrmMetricCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <h2 className="font-bold text-ink-950">Acoes comerciais</h2>
          <p className="mt-1 text-sm text-slate-500">
            Atalhos para manter o funil andando.
          </p>
        </div>
        <div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-h-36 flex-col bg-white p-5 transition hover:bg-brand-50/60 sm:p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-bold text-ink-950">{action.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {action.description}
                </p>
                <ArrowRight className="mt-auto size-4 self-end text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
