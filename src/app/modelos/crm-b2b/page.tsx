import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  KanbanSquare,
  ListChecks,
  MessageCircle,
  PhoneCall,
  Target,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";

export const metadata: Metadata = {
  title: "CRM B2B para servicos",
  description:
    "Sistema para servicos B2B com leads, propostas, tarefas e acompanhamento comercial.",
};

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "5531999998888";
const whatsappText = encodeURIComponent(
  "Ola! Quero ver a demo do CRM B2B da ModuCore.",
);
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

const features = [
  {
    title: "Leads organizados",
    description:
      "Pipeline por etapa para saber quem chegou, quem foi contatado e quem precisa de proposta.",
    icon: Target,
  },
  {
    title: "Propostas comerciais",
    description:
      "Registro de proposta, valor, status, validade e observacoes para acompanhar negociacoes.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Tarefas e follow-ups",
    description:
      "Pendencias por prioridade, prazo e vinculo com cliente ou lead para o time nao perder retorno.",
    icon: ListChecks,
  },
  {
    title: "Historico comercial",
    description:
      "Cliente, contatos, notas, agendamentos e proximos passos reunidos em uma visao simples.",
    icon: ClipboardCheck,
  },
];

const flow = [
  "Lead entra pelo WhatsApp, indicacao, formulario ou prospeccao.",
  "Equipe registra origem, valor estimado e etapa do pipeline.",
  "Proposta e tarefas ficam vinculadas ao cliente ou oportunidade.",
  "Gestor acompanha pendencias, status e proximos retornos.",
];

const painPoints = [
  "Vendedor esquece retorno porque a conversa ficou perdida.",
  "Proposta enviada nao tem status claro nem dono acompanhando.",
  "Cliente B2B demora para decidir e ninguem sabe o proximo passo.",
  "Gestor precisa perguntar tudo no grupo antes de saber como esta o comercial.",
];

export default function CrmB2BPage() {
  return (
    <main className="bg-slate-50 pb-24 text-ink-950 sm:pb-0">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-72 bg-ink-950" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Logo className="[&_span:last-child]:text-white" />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-bold text-slate-300 transition hover:text-white sm:inline-flex"
            >
              Voltar
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-ink-950 transition hover:bg-brand-50 sm:inline-flex"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-10 lg:pb-20 lg:pt-14">
          <div className="text-white">
            <Badge className="border border-white/10 bg-white/10 text-brand-100">
              CRM B2B
            </Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              CRM simples para vender B2B sem perder follow-up.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Um modelo de CRM para empresas de servico que vendem por
              relacionamento, precisam acompanhar oportunidades por semanas e
              nao podem depender de memoria, planilha e conversa solta.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 shadow-lg shadow-black/15 transition hover:bg-brand-50"
              >
                Quero uma demo do CRM B2B
                <MessageCircle className="size-5" />
              </a>
              <a
                href="#como-funciona"
              className="hidden min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-base font-bold text-white transition hover:bg-white/15 sm:inline-flex"
              >
                Ver funcionamento
                <ArrowRight className="size-5" />
              </a>
            </div>
          </div>

          <CrmPreview />
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-brand-600">
              O problema
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Venda B2B quebra quando o acompanhamento depende da memoria.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Servicos B2B costumam ter ciclo de decisao maior, varias
              conversas, proposta, retorno, negociacao e tarefas internas. Sem
              sistema, tudo vira pergunta repetida.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40"
              >
                <Clock3 className="mb-4 size-6 text-amber-600" />
                <p className="text-sm leading-6 text-slate-600">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-violet-700">
              O que vem no modelo
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Uma base comercial pronta para vender, acompanhar e cobrar
              proximo passo.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-brand-600">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Do primeiro contato ate a proposta acompanhada.
            </h2>
          </div>
          <div className="space-y-3">
            {flow.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 px-5 py-20 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-brand-100">
                Oferta
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                Comece com uma demo do CRM B2B e adapte para seu nicho.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Ideal para consultorias, agencias, prestadores recorrentes,
                empresas tecnicas, servicos corporativos e times comerciais
                pequenos que precisam de processo sem burocracia.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              {[
                "Pipeline de leads",
                "Cadastro de clientes",
                "Propostas e valores",
                "Tarefas de follow-up",
                "Historico comercial",
              ].map((item) => (
                <div key={item} className="mb-4 flex gap-3 text-sm last:mb-0">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                  {item}
                </div>
              ))}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 transition hover:bg-brand-50"
              >
                Chamar no WhatsApp
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <MobileWhatsAppCta href={whatsappHref} label="Pedir demo do CRM" />
    </main>
  );
}

function CrmPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-950/15">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Pipeline comercial
          </p>
          <h2 className="mt-1 text-xl font-black">Leads B2B</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          Ao vivo
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Novo", "Diagnostico fiscal", "Lead inbound"],
          ["Proposta", "Implantacao CRM", "R$ 12.000"],
          ["Follow-up", "Contrato mensal", "Retornar sexta"],
        ].map(([stage, title, helper]) => (
          <div key={stage} className="rounded-2xl bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase text-slate-500">
                {stage}
              </p>
              <KanbanSquare className="size-4 text-brand-600" />
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <p className="font-bold text-ink-950">{title}</p>
              <p className="mt-2 text-xs text-slate-500">{helper}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Leads abertos", value: "18", icon: UsersRound },
          { label: "Propostas", value: "7", icon: BarChart3 },
          { label: "Tarefas hoje", value: "5", icon: PhoneCall },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="rounded-2xl border border-slate-200 p-4">
              <Icon className="mb-3 size-5 text-brand-600" />
              <p className="text-xs font-bold uppercase text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-2xl font-black">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
