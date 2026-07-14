import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageCircle,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";

export const metadata: Metadata = {
  title: "Precos",
  description:
    "Pacotes comerciais da ModuCore com setup, mensalidade e customizacao para sistemas personalizados.",
};

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "5531999998888";
const whatsappText = encodeURIComponent(
  "Ola! Quero entender os planos da ModuCore para meu negocio.",
);
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

const packages = [
  {
    name: "Setup simples",
    price: "R$ 497 a R$ 997",
    description: "Instalacao, personalizacao basica e treinamento",
    icon: Settings2,
    tone: "blue",
    featured: false,
    items: [
      "Configuracao inicial do sistema",
      "Ajustes basicos de textos, campos e cores",
      "Modelo escolhido pronto para demonstracao",
      "Treinamento inicial para usar o fluxo principal",
    ],
  },
  {
    name: "Mensalidade",
    price: "R$ 97 a R$ 297/mes",
    description: "Hospedagem, suporte e ajustes pequenos",
    icon: BadgeDollarSign,
    tone: "green",
    featured: true,
    items: [
      "Hospedagem e manutencao do sistema",
      "Suporte para duvidas e pequenos ajustes",
      "Correcoes e melhorias simples no fluxo existente",
      "Base pronta para evoluir sem recomecar",
    ],
  },
  {
    name: "Customizacao",
    price: "Sob orcamento",
    description: "Modulos especificos",
    icon: Wrench,
    tone: "violet",
    featured: false,
    items: [
      "Novas telas ou regras de negocio",
      "Modulos especificos para o nicho",
      "Fluxos sob medida para a operacao",
      "Escopo definido antes da implementacao",
    ],
  },
] as const;

const steps = [
  "Escolha o modelo inicial: CRM B2B, Agenda, Propostas ou outro fluxo.",
  "Feche o setup para colocar o sistema no ar com personalizacao basica.",
  "Mantenha a mensalidade para hospedagem, suporte e ajustes pequenos.",
  "Quando precisar de algo maior, orcamos a customizacao separadamente.",
];

function toneClasses(tone: "blue" | "green" | "violet") {
  const tones = {
    blue: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return tones[tone];
}

export default function PricingPage() {
  return (
    <main className="bg-slate-50 pb-24 text-ink-950 sm:pb-0">
      <section className="relative overflow-hidden bg-ink-950 text-white">
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

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-14">
          <Badge className="border border-white/10 bg-white/10 text-brand-100">
            <Sparkles className="mr-1.5 size-3.5" />
            Oferta comercial
          </Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Precos simples para vender pelo WhatsApp e implantar rapido.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Pacotes claros para pequenos negocios sairem da planilha sem uma
            venda longa, tecnica e cheia de etapas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 shadow-lg shadow-black/15 transition hover:bg-brand-50"
            >
              Conversar sobre pacotes
              <MessageCircle className="size-5" />
            </a>
            <a
              href="#pacotes"
              className="hidden min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-base font-bold text-white transition hover:bg-white/15 sm:inline-flex"
            >
              Ver pacotes
              <ArrowRight className="size-5" />
            </a>
            <Link
              href="/diagnostico"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-base font-bold text-white transition hover:bg-white/15"
            >
              Fazer diagnostico
              <ClipboardList className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="pacotes" className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-brand-600">
              Pacotes sugeridos
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Tres formas simples de vender sem confundir o cliente.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {packages.map((plan) => {
              const Icon = plan.icon;

              return (
                <article
                  key={plan.name}
                  className={`relative rounded-3xl border bg-white p-6 shadow-sm shadow-slate-200/50 ${
                    plan.featured
                      ? "border-emerald-200 ring-4 ring-emerald-50"
                      : "border-slate-200"
                  }`}
                >
                  {plan.featured ? (
                    <span className="absolute right-5 top-5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Recorrencia
                    </span>
                  ) : null}
                  <span
                    className={`grid size-12 place-items-center rounded-2xl ${toneClasses(plan.tone)}`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-2xl font-black">{plan.name}</h3>
                  <p className="mt-4 text-3xl font-black tracking-tight">
                    {plan.price}
                  </p>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>
                  <div className="mt-6 space-y-3">
                    {plan.items.map((item) => (
                      <div key={item} className="flex gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-violet-700">
              Como vender
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Setup paga a entrada. Mensalidade sustenta. Customizacao expande.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              O cliente entende o investimento inicial, sabe quanto custa manter
              o sistema e consegue pedir evolucoes sem transformar tudo em um
              projeto nebuloso.
            </p>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-ink-950 text-white">
          <div className="grid gap-px bg-white/10 lg:grid-cols-[1fr_380px]">
            <div className="bg-ink-950 p-7 sm:p-10">
              <p className="text-sm font-bold uppercase text-brand-100">
                Proxima conversa
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                Feche um pacote inicial e coloque a primeira demo para vender.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Use os modelos de CRM B2B e Agenda como ponto de partida, ou
                monte uma proposta com modulos especificos.
              </p>
            </div>
            <div className="bg-white p-7 text-ink-950 sm:p-10">
              <ClipboardList className="size-10 text-brand-600" />
              <h3 className="mt-5 text-2xl font-black">Resumo comercial</h3>
              <div className="mt-6 space-y-4">
                {[
                  "Setup: R$ 497 a R$ 997",
                  "Mensalidade: R$ 97 a R$ 297/mes",
                  "Customizacao: sob orcamento",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-6 text-base font-bold text-white transition hover:bg-brand-700"
              >
                Chamar no WhatsApp
                <MessageCircle className="size-5" />
              </a>
              <Link
                href="/diagnostico"
                className="mt-3 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-base font-bold text-ink-950 transition hover:bg-slate-50"
              >
                Preencher diagnostico
                <ClipboardList className="size-5" />
              </Link>
              <Link
                href="/apresentacao-comercial"
                className="mt-3 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-base font-bold text-ink-950 transition hover:bg-slate-50"
              >
                Ver apresentacao
                <FileText className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <MobileWhatsAppCta href={whatsappHref} label="Tirar duvida no WhatsApp" />
    </main>
  );
}
