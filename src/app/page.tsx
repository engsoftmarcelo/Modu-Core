import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ListChecks,
  MessageCircle,
  MonitorSmartphone,
  Target,
  UsersRound,
  Wrench,
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

export const metadata: Metadata = {
  title: "Sistemas personalizados para pequenos negocios",
  description:
    "CRM, agenda, matriculas e ordens de servico para pequenos negocios venderem, atenderem e se organizarem melhor.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero uma demonstracao do ModuCore para organizar meu negocio.",
);

const models = [
  {
    title: "CRM B2B",
    description: "Leads, clientes, propostas e follow-ups em um fluxo comercial claro.",
    href: "/modelos/crm-b2b",
    icon: UsersRound,
    tone: "border-brand-200 bg-brand-50 text-brand-700",
  },
  {
    title: "Agenda",
    description: "Servicos, profissionais, horarios e confirmacao pelo WhatsApp.",
    href: "/modelos/agenda",
    icon: CalendarCheck2,
    tone: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    title: "Propostas",
    description: "Orcamentos profissionais, valores, validade e acompanhamento de status.",
    href: "/diagnostico",
    icon: BriefcaseBusiness,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    title: "Tarefas",
    description: "Pendencias, prioridades e proximas acoes organizadas para a equipe.",
    href: "/diagnostico",
    icon: ListChecks,
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    title: "Matriculas",
    description: "Cursos, turmas, alunos, frequencia e certificados em uma unica base.",
    href: "/diagnostico",
    icon: BadgeCheck,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    title: "Ordens de servico",
    description: "Orcamento, checklist, fotos e conclusao para equipes externas.",
    href: "/diagnostico",
    icon: Wrench,
    tone: "border-teal-200 bg-teal-50 text-teal-700",
  },
] as const;

const screenshots = [
  {
    src: "/images/product-crm.png",
    title: "CRM e pipeline",
    description: "Indicadores e oportunidades comerciais em uma visao objetiva.",
  },
  {
    src: "/images/product-agenda.png",
    title: "Agenda de atendimento",
    description: "Calendario, horarios e status para a rotina do negocio.",
  },
  {
    src: "/images/product-work-orders.png",
    title: "Ordem de servico",
    description: "Cliente, checklist, WhatsApp e conclusao em campo.",
  },
] as const;

const steps = [
  ["01", "Diagnostico", "Entendemos como sua empresa vende, atende e acompanha clientes."],
  ["02", "Configuracao", "Escolhemos os modulos e ajustamos campos, identidade e fluxos."],
  ["03", "Validacao", "Testamos a demo com dados e cenarios proximos da sua operacao."],
  ["04", "Implantacao", "Entregamos o sistema, treinamento e suporte para comecar."],
] as const;

export default function LandingPage() {
  return (
    <main className="marketing-shell bg-white pb-24 text-ink-950 sm:pb-0">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ModelsSection />
      <ProductSection />
      <ProcessSection />
      <BenefitsSection />
      <OfferSection />
      <SiteFooter />
      <MobileWhatsAppCta href={whatsappHref} label="Pedir demo no WhatsApp" />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[86svh] overflow-hidden bg-ink-950 text-white">
      <Image
        src="/images/product-dashboard.png"
        alt="Dashboard real do ModuCore"
        fill
        priority
        sizes="100vw"
        className="object-cover object-left-top"
      />
      <div className="absolute inset-0 bg-ink-950/85" />
      <SiteHeader inverse overlay whatsappHref={whatsappHref} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
        <div className="max-w-4xl">
          <p className="text-sm font-bold text-sky-300">
            CRM · Agenda · Matriculas · Ordens de servico
          </p>
          <h1 className="font-display mt-4 text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
            Sistemas personalizados para pequenos negocios
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8">
            Organize vendas, atendimentos e equipe em uma plataforma simples,
            mobile-first e conectada ao WhatsApp.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-5 text-base font-bold text-white shadow-sm transition-colors hover:border-emerald-800 hover:bg-emerald-800"
            >
              <MessageCircle className="size-5" />
              Pedir demonstracao
            </a>
            <a
              href="#modelos"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/30 bg-ink-950/40 px-5 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Conhecer modelos
              <ArrowRight className="size-5" />
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <CheckCircle2 className="size-5 text-emerald-400" />
            Implantacao guiada, dados separados por empresa e suporte proximo.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    "Cliente no WhatsApp, proposta na conversa e retorno esquecido.",
    "Agenda manual, horario duplicado e atendimento sem historico.",
    "Servico executado sem checklist, fotos ou confirmacao do cliente.",
    "Informacao espalhada entre planilhas, cadernos e grupos da equipe.",
  ];

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <SectionHeading
          eyebrow="O problema"
          title="A operacao espalhada custa tempo e vendas."
          description="Pequenos negocios nao precisam de mais uma ferramenta complicada. Precisam enxergar o que fazer agora e manter o historico no lugar certo."
        />
        <div className="border-y border-slate-200">
          {problems.map((problem) => (
            <div key={problem} className="flex gap-4 border-b border-slate-200 py-5 last:border-0">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <p className="text-sm leading-6 text-slate-600 sm:text-base">{problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const pillars = [
    {
      title: "Venda com acompanhamento",
      description: "Leads, clientes, propostas e retornos ligados no mesmo fluxo.",
      icon: Target,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      title: "Atenda com contexto",
      description: "Agenda, WhatsApp, historico e proximos passos acessiveis no celular.",
      icon: MonitorSmartphone,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      title: "Execute com controle",
      description: "Tarefas, checklists, fotos e confirmacoes que deixam o trabalho rastreavel.",
      icon: ClipboardList,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="A solucao"
          title="Uma base modular, adaptada ao jeito real de trabalhar."
          description="Comece com o essencial e adicione modulos quando a operacao pedir, sem recomecar o sistema do zero."
        />
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-lg border border-slate-200 bg-white p-6">
                <span className={`grid size-11 place-items-center rounded-lg ${pillar.tone}`}>
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ModelsSection() {
  return (
    <section id="modelos" className="scroll-mt-16 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Modelos de sistema"
            title="Escolha um ponto de partida."
            description="Cada modelo resolve um fluxo completo e pode receber os ajustes do seu negocio."
          />
          <Link
            href="/diagnostico"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            Encontrar meu modelo
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => {
            const Icon = model.icon;
            return (
              <Link
                key={model.title}
                href={model.href}
                className="group flex min-h-48 flex-col rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid size-10 place-items-center rounded-lg border ${model.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-slate-300 transition-colors group-hover:text-brand-600" />
                </div>
                <h3 className="mt-5 font-bold">{model.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{model.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="produto" className="scroll-mt-16 bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Produto real"
          title="Telas feitas para a rotina, nao para a apresentacao."
          description="Os exemplos abaixo usam dados ficticios das demonstracoes e mostram os fluxos que o cliente realmente recebe."
        />

        <figure className="mt-9 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.10)]">
          <Image
            src="/images/product-dashboard.png"
            alt="Dashboard do ModuCore com indicadores e acoes rapidas"
            width={1600}
            height={1000}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
            Dashboard geral com indicadores, atividade recente e atalhos operacionais.
          </figcaption>
        </figure>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {screenshots.map((screenshot) => (
            <figure key={screenshot.src} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="aspect-[16/10] overflow-hidden border-b border-slate-200 bg-slate-100">
                <Image
                  src={screenshot.src}
                  alt={screenshot.title}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="h-full w-full object-cover object-left-top"
                />
              </div>
              <figcaption className="p-5">
                <p className="font-bold">{screenshot.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{screenshot.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Como funciona"
          title="Da conversa inicial ao sistema em uso."
          description="Um processo curto, com validacao frequente e sem linguagem tecnica desnecessaria."
        />
        <ol className="mt-9 grid border-y border-slate-200 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <li
              key={number}
              className="border-b border-slate-200 py-6 md:border-r md:px-6 md:first:pl-0 lg:border-b-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <span className="text-sm font-bold text-brand-700">{number}</span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    "Menos planilhas e conversas perdidas.",
    "Poucos cliques nos fluxos mais frequentes.",
    "Acesso confortavel em notebook, tablet e celular.",
    "WhatsApp presente nos pontos de contato com o cliente.",
    "Dados separados e protegidos por empresa.",
    "Base pronta para evoluir com novos modulos.",
  ];

  return (
    <section className="bg-ink-950 px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          inverse
          eyebrow="Beneficios"
          title="Mais controle, sem aumentar a burocracia."
          description="A interface prioriza clareza e velocidade para quem precisa trabalhar, nao administrar software."
        />
        <div className="grid gap-x-8 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex gap-3 border-b border-slate-800 py-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              <p className="text-sm leading-6 text-slate-200">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferSection() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 border-y border-slate-200 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-bold text-brand-700">Oferta inicial</p>
          <h2 className="font-display mt-3 max-w-3xl text-3xl leading-tight sm:text-5xl">
            Comece com uma demo pronta para o seu processo.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Setup a partir de R$ 497, com personalizacao basica, treinamento e
            opcoes de suporte mensal.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-5 font-bold text-white hover:border-emerald-800 hover:bg-emerald-800"
          >
            <MessageCircle className="size-5" />
            Conversar no WhatsApp
          </a>
          <Link
            href="/precos"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 font-bold hover:border-brand-300 hover:bg-brand-50"
          >
            Ver pacotes e precos
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
