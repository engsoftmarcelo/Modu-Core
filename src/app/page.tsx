import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  MessageCircle,
  MonitorSmartphone,
  MousePointerClick,
  PanelsTopLeft,
  Sparkles,
  Target,
  UsersRound,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

export const metadata: Metadata = {
  title: "Sistemas personalizados para pequenos negocios",
  description:
    "Landing page comercial da ModuCore para pequenos negocios venderem, atenderem e se organizarem melhor.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero uma demo do ModuCore para organizar meu negocio.",
);

const models = [
  {
    title: "CRM de clientes",
    description:
      "Cadastro, contatos, historico, funil de leads e follow-ups no mesmo fluxo.",
    href: "/modelos/crm-b2b",
    icon: UsersRound,
    tone: "blue",
  },
  {
    title: "Agenda de atendimentos",
    description:
      "Servicos, profissionais, horarios, confirmacao por WhatsApp e comparecimento.",
    href: "/modelos/agenda",
    icon: CalendarCheck2,
    tone: "violet",
  },
  {
    title: "Propostas comerciais",
    description:
      "Propostas simples com cliente, servicos, valores, validade e status.",
    icon: BriefcaseBusiness,
    tone: "green",
  },
  {
    title: "Tarefas e operacao",
    description:
      "Pendencias, prioridades, responsaveis e proximas acoes para a equipe.",
    icon: ClipboardList,
    tone: "amber",
  },
  {
    title: "Matriculas e cursos",
    description:
      "Modelo preparado para escolas livres, turmas, alunos e acompanhamento.",
    icon: BadgeCheck,
    tone: "blue",
  },
  {
    title: "Ordens de servico",
    description:
      "Base para assistencias, oficinas e empresas que precisam controlar execucao.",
    icon: Wrench,
    tone: "violet",
  },
] as const;

const benefits = [
  "Menos planilhas espalhadas e menos informacao perdida.",
  "Processo comercial com clientes, propostas e retorno no lugar certo.",
  "Agenda clara para acompanhar atendimentos antes e depois do servico.",
  "Sistema modular, feito para comecar enxuto e crescer com o negocio.",
  "Interface responsiva para consultar a operacao pelo computador ou celular.",
  "Base pronta para adaptar ao modelo real da empresa.",
];

const steps = [
  {
    title: "1. Entendimento",
    description:
      "Mapeamos como o negocio vende, atende, agenda e acompanha clientes.",
  },
  {
    title: "2. Montagem do sistema",
    description:
      "Escolhemos os modulos certos e ajustamos campos, fluxos e telas.",
  },
  {
    title: "3. Demo com dados reais",
    description:
      "Validamos cliente, servico, agendamento, WhatsApp, comparecimento e historico.",
  },
  {
    title: "4. Entrega inicial",
    description:
      "A empresa recebe um sistema usavel, com base para evoluir sem recomecar.",
  },
];

const screenshots = [
  {
    title: "Dashboard",
    description: "Indicadores, proximas acoes e atalhos operacionais.",
    icon: LayoutDashboard,
  },
  {
    title: "CRM",
    description: "Clientes, leads, busca e historico de atendimento.",
    icon: UsersRound,
  },
  {
    title: "Agenda",
    description: "Calendario semanal, servicos, status e WhatsApp.",
    icon: CalendarCheck2,
  },
];

function toneClasses(tone: "blue" | "violet" | "green" | "amber") {
  const tones = {
    blue: "bg-brand-50 text-brand-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return tones[tone];
}

export default function LandingPage() {
  return (
    <main className="bg-slate-50 pb-24 text-ink-950 sm:pb-0">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ModelsSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PrintsSection />
      <CtaSection />
      <MobileWhatsAppCta href={whatsappHref} label="Pedir demo no WhatsApp" />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0 hidden opacity-75 sm:block">
        <HeroInterfaceScene />
      </div>
      <div className="absolute inset-0 bg-ink-950/60" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Logo className="[&_span:last-child]:text-white" />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
          <a href="#modelos" className="transition hover:text-white">
            Modelos
          </a>
          <a href="#prints" className="transition hover:text-white">
            Prints
          </a>
          <Link href="/precos" className="transition hover:text-white">
            Precos
          </Link>
          <Link href="/diagnostico" className="transition hover:text-white">
            Diagnostico
          </Link>
          <Link href="/apresentacao-comercial" className="transition hover:text-white">
            Apresentacao
          </Link>
          <a href="#oferta" className="transition hover:text-white">
            Oferta
          </a>
        </nav>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="hidden min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-ink-950 transition hover:bg-brand-50 sm:inline-flex"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </a>
      </header>

      <div className="relative z-10 mx-auto flex max-w-7xl items-center px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="max-w-3xl">
          <Badge className="hidden border border-white/10 bg-white/10 text-brand-100 sm:inline-flex">
            <Sparkles className="mr-1.5 size-3.5" />
            Landing comercial da ModuCore
          </Badge>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:mt-6 sm:text-4xl lg:text-5xl">
            Organize vendas e atendimentos pelo celular, com WhatsApp no centro.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Sistemas simples para pequenos negocios que vendem por rede social,
            conversam pelo WhatsApp e precisam parar de depender de planilha.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 shadow-lg shadow-black/20 transition hover:bg-brand-50"
            >
                Pedir demo no WhatsApp
              <MessageCircle className="size-5" />
            </a>
            <a
              href="#prints"
              className="hidden min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-base font-bold text-white transition hover:bg-white/15 sm:inline-flex"
            >
              Ver prints do sistema
              <ArrowRight className="size-5" />
            </a>
          </div>
          <div className="mt-8 hidden max-w-3xl gap-3 text-sm font-semibold text-slate-200 lg:grid lg:grid-cols-3">
            {["CRM pronto", "Agenda com WhatsApp", "Historico do cliente"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-300" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroInterfaceScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-10">
      <div className="grid w-[1100px] max-w-none gap-4 lg:grid-cols-[260px_1fr]">
        <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur md:block">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-ink-950 text-sm font-black text-white">
              M
            </div>
            <div>
              <div className="h-3 w-24 rounded-full bg-white/80" />
              <div className="mt-2 h-2 w-16 rounded-full bg-white/25" />
            </div>
          </div>
          {["Dashboard", "CRM", "Agenda", "Propostas", "Tarefas"].map(
            (item, index) => (
              <div
                key={item}
                className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3"
              >
                <div className="size-8 rounded-xl bg-white/15" />
                <div className="h-2 rounded-full bg-white/50" style={{ width: 82 + index * 12 }} />
              </div>
            ),
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/15 p-4 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="h-4 w-44 rounded-full bg-white/85" />
              <div className="mt-3 h-3 w-72 max-w-full rounded-full bg-white/30" />
            </div>
            <div className="hidden h-11 w-36 rounded-xl bg-white/85 sm:block" />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {["Clientes", "Leads", "Agenda", "Propostas"].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-ink-950">
                <div className="mb-4 size-9 rounded-xl bg-brand-50" />
                <div className="text-xs font-bold text-slate-400">{item}</div>
                <div className="mt-2 h-5 w-14 rounded-full bg-ink-950" />
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="rounded-2xl bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-36 rounded-full bg-ink-950" />
                <div className="h-7 w-16 rounded-full bg-brand-50" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((column) => (
                  <div key={column} className="rounded-xl bg-slate-100 p-3">
                    <div className="mb-3 h-3 w-20 rounded-full bg-slate-300" />
                    {[0, 1, 2].map((card) => (
                      <div
                        key={card}
                        className="mb-2 rounded-xl bg-white p-3 shadow-sm"
                      >
                        <div className="h-3 w-24 rounded-full bg-slate-800" />
                        <div className="mt-2 h-2 w-16 rounded-full bg-slate-300" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <div className="mb-4 h-4 w-28 rounded-full bg-ink-950" />
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="mb-3 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-violet-50" />
                  <div>
                    <div className="h-3 w-24 rounded-full bg-slate-700" />
                    <div className="mt-2 h-2 w-16 rounded-full bg-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-brand-600">Problema</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
            Pequenos negocios perdem venda porque a operacao fica espalhada.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Cliente no WhatsApp, proposta na conversa e retorno esquecido.",
            "Agenda manual, horario duplicado e atendimento sem historico.",
            "Servico feito, mas sem registro do que aconteceu.",
            "Dono do negocio preso em planilha quando precisava vender.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <Clock3 className="mb-4 size-6 text-amber-600" />
              <p className="text-sm leading-6 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-violet-700">Solucao</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
            Um sistema modular para transformar rotina baguncada em processo
            comercial.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            A ModuCore junta cadastro, agenda, propostas, tarefas e historico
            em uma base unica. O cliente ve um sistema pronto para usar, mas
            adaptavel ao modelo dele.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Venda",
              text: "Leads, clientes, propostas e proximas acoes em um fluxo claro.",
              icon: Target,
            },
            {
              title: "Atendimento",
              text: "Agenda, servicos, confirmacao por WhatsApp e status do atendimento.",
              icon: MousePointerClick,
            },
            {
              title: "Retencao",
              text: "Historico do cliente, observacoes e proximo retorno para nao sumir depois da venda.",
              icon: MonitorSmartphone,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-ink-950 text-white">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ModelsSection() {
  return (
    <section id="modelos" className="bg-white px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-brand-600">
              Modelos de sistema
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Escolha o ponto de partida e personalize o resto.
            </h2>
          </div>
          <Badge tone="green" className="w-fit">
            Oferta inicial pronta para demo
          </Badge>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => {
            const Icon = model.icon;

            return (
              <Link
                key={model.title}
                href={"href" in model ? model.href : "#modelos"}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${toneClasses(model.tone)}`}
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-black">{model.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {model.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-violet-700">
            Como funciona
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
            Da conversa inicial para uma demo vendavel.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-ink-950 px-5 py-20 text-white sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase text-brand-100">
            Beneficios
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
            Mais controle sem transformar o negocio em um monstro de software.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
              <p className="text-sm leading-6 text-slate-200">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrintsSection() {
  return (
    <section id="prints" className="bg-white px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-brand-600">Prints</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
            Telas pensadas para demonstrar valor em poucos minutos.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {screenshots.map((screenshot, index) => {
            const Icon = screenshot.icon;

            return (
              <article
                key={screenshot.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="border-b border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-black">{screenshot.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {screenshot.description}
                      </p>
                    </div>
                  </div>
                </div>
                <ProductPrint variant={index} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductPrint({ variant }: { variant: number }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-3 w-28 rounded-full bg-ink-950" />
            <div className="mt-2 h-2 w-40 rounded-full bg-slate-200" />
          </div>
          <div className="size-9 rounded-xl bg-violet-50" />
        </div>

        {variant === 0 ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-xl bg-slate-100 p-3">
                  <div className="mb-3 size-7 rounded-lg bg-brand-100" />
                  <div className="h-3 w-12 rounded-full bg-ink-950" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-slate-300" />
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="mb-2 flex items-center gap-3 rounded-lg bg-white p-2 last:mb-0"
                >
                  <div className="size-7 rounded-lg bg-emerald-50" />
                  <div className="h-2 flex-1 rounded-full bg-slate-300" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {variant === 1 ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((column) => (
              <div key={column} className="rounded-xl bg-slate-100 p-2">
                <div className="mb-3 h-2 w-12 rounded-full bg-slate-400" />
                {[0, 1, 2].map((item) => (
                  <div key={item} className="mb-2 rounded-lg bg-white p-2">
                    <div className="h-2 w-14 rounded-full bg-ink-950" />
                    <div className="mt-2 h-2 w-10 rounded-full bg-slate-300" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {variant === 2 ? (
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((day) => (
              <div key={day} className="rounded-xl bg-slate-100 p-2">
                <div className="mb-3 h-2 w-10 rounded-full bg-slate-400" />
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="mb-2 h-12 rounded-lg bg-violet-50 p-2"
                  >
                    <div className="h-2 w-10 rounded-full bg-violet-600" />
                    <div className="mt-2 h-2 w-8 rounded-full bg-violet-200" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CtaSection() {
  return (
    <section id="oferta" className="px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70">
        <div className="grid gap-px bg-slate-200 lg:grid-cols-[1fr_380px]">
          <div className="bg-white p-7 sm:p-10">
            <p className="text-sm font-bold uppercase text-brand-600">
              Oferta inicial
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Comece com uma demo comercial e evolua para o sistema do cliente.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              A primeira entrega pode focar em um modelo vendavel: CRM, agenda,
              WhatsApp, historico e prints prontos para apresentar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-ink-950 px-6 text-base font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
              >
                Chamar no WhatsApp
                <MessageCircle className="size-5" />
              </a>
              <Link
                href="/diagnostico"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-base font-bold text-ink-950 transition hover:bg-slate-50"
              >
                Fazer diagnostico
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
          <div className="bg-ink-950 p-7 text-white sm:p-10">
            <PanelsTopLeft className="size-10 text-brand-100" />
            <h3 className="mt-5 text-2xl font-black">Pacote da primeira venda</h3>
            <div className="mt-6 space-y-4">
              {[
                "Landing page principal",
                "Modelos de sistema para nichos",
                "Copy comercial objetiva",
                "Prints do produto",
                "CTA direto para WhatsApp",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
