import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  ListChecks,
  Plus,
  Target,
  UsersRound,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDashboardMetrics } from "@/features/dashboard/queries";
import { getWorkspaceIdentity } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const identity = await getWorkspaceIdentity();
  const metrics = await getDashboardMetrics(identity?.organizationId ?? null);
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold capitalize text-slate-400">{today}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Visao geral
          </h1>
          <p className="mt-2 text-slate-500">
            O essencial da operacao, sem ruido.
          </p>
        </div>
        <Link
          href="/crm"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Novo cliente
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Clientes ativos"
          value={metrics.customers}
          helper="Base atual de clientes"
          icon={UsersRound}
        />
        <MetricCard
          label="Leads em aberto"
          value={metrics.openLeads}
          helper="Novos, contatados e qualificados"
          icon={Target}
          tone="violet"
        />
        <MetricCard
          label="Tarefas pendentes"
          value={metrics.pendingTasks}
          helper="Pendentes ou em andamento"
          icon={ListChecks}
          tone="amber"
        />
        <MetricCard
          label="Proximos 7 dias"
          value={metrics.upcomingAppointments}
          helper="Atendimentos agendados"
          icon={CalendarClock}
          tone="blue"
        />
        <MetricCard
          label="Propostas aceitas"
          value={formatCurrency(metrics.acceptedRevenue)}
          helper="Valor acumulado"
          icon={CircleDollarSign}
          tone="green"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold text-ink-950">Atividade recente</h2>
              <p className="mt-1 text-sm text-slate-500">
                Alteracoes importantes aparecem aqui.
              </p>
            </div>
            <Badge tone="blue">Ao vivo</Badge>
          </div>
          <div className="grid min-h-64 place-items-center px-6 py-10 text-center">
            <div className="max-w-sm">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <ListChecks className="size-6" />
              </span>
              <p className="mt-5 font-bold text-ink-950">Tudo tranquilo por aqui</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Cadastre o primeiro cliente ou compromisso para iniciar o historico
                da operacao.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-ink-950">Acoes rapidas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Atalhos para os fluxos mais comuns.
          </p>
          <div className="mt-5 space-y-2">
            {[
              { label: "Cadastrar cliente", href: "/crm", icon: UsersRound },
              { label: "Agendar atendimento", href: "/agenda", icon: CalendarClock },
              { label: "Criar proposta", href: "/propostas", icon: CircleDollarSign },
              { label: "Adicionar tarefa", href: "/tarefas/novo", icon: ListChecks },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-ink-950 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <Icon className="size-5 text-brand-600" />
                  {action.label}
                  <ArrowRight className="ml-auto size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
