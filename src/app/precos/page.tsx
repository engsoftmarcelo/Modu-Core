import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Settings2,
  Wrench,
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

export const metadata: Metadata = {
  title: "Precos",
  description:
    "Pacotes da ModuCore com setup, mensalidade e customizacao para sistemas personalizados.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero entender os planos da ModuCore para meu negocio.",
);

const packages = [
  {
    name: "Setup simples",
    price: "R$ 497 a R$ 997",
    description: "Instalacao, personalizacao basica e treinamento.",
    icon: Settings2,
    tone: "border-brand-200 bg-brand-50 text-brand-700",
    items: [
      "Configuracao inicial do sistema",
      "Ajustes basicos de textos, campos e identidade",
      "Modelo escolhido pronto para demonstracao",
      "Treinamento do fluxo principal",
    ],
  },
  {
    name: "Mensalidade",
    price: "R$ 97 a R$ 297/mes",
    description: "Hospedagem, suporte e pequenos ajustes.",
    icon: BadgeDollarSign,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    featured: true,
    items: [
      "Hospedagem e manutencao",
      "Suporte para duvidas",
      "Correcoes e ajustes simples",
      "Base pronta para evoluir",
    ],
  },
  {
    name: "Customizacao",
    price: "Sob orcamento",
    description: "Modulos e regras especificas para sua operacao.",
    icon: Wrench,
    tone: "border-violet-200 bg-violet-50 text-violet-700",
    items: [
      "Novas telas ou regras de negocio",
      "Modulos especificos para o nicho",
      "Integracoes e fluxos sob medida",
      "Escopo definido antes da implementacao",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <main className="marketing-shell bg-white pb-24 text-ink-950 sm:pb-0">
      <section className="relative isolate flex min-h-[76svh] overflow-hidden bg-ink-950 text-white">
        <Image
          src="/images/product-dashboard.png"
          alt="ModuCore em uso"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left-top"
        />
        <div className="absolute inset-0 bg-ink-950/88" />
        <SiteHeader inverse overlay whatsappHref={whatsappHref} />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <p className="text-sm font-bold text-sky-300">Oferta comercial</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
              Planos ModuCore
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8">
              Comece com um setup acessivel, mantenha hospedagem e suporte, e
              invista em customizacoes somente quando fizer sentido.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-5 font-bold text-white hover:border-emerald-800 hover:bg-emerald-800"
              >
                <MessageCircle className="size-5" />
                Conversar sobre os planos
              </a>
              <a
                href="#pacotes"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/30 bg-ink-950/40 px-5 font-bold text-white hover:bg-white/10"
              >
                Ver pacotes
                <ArrowRight className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="pacotes" className="scroll-mt-16 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Pacotes sugeridos"
            title="Investimento claro em cada etapa."
            description="Os valores iniciais ajudam a validar o escopo. O preco final depende dos modulos e ajustes escolhidos."
          />

          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {packages.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className={`relative rounded-lg border bg-white p-6 ${
                    "featured" in plan && plan.featured
                      ? "border-emerald-300 shadow-[0_12px_30px_rgba(5,150,105,0.10)]"
                      : "border-slate-200"
                  }`}
                >
                  {"featured" in plan && plan.featured ? (
                    <span className="absolute right-5 top-5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                      Mais recorrente
                    </span>
                  ) : null}
                  <span className={`grid size-11 place-items-center rounded-lg border ${plan.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-xl font-bold">{plan.name}</h2>
                  <p className="mt-3 text-3xl font-bold">{plan.price}</p>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    {plan.items.map((item) => (
                      <div key={item} className="flex gap-3 py-1.5 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
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

      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Como contratar"
            title="Setup para comecar. Mensalidade para manter."
            description="Customizacoes maiores ficam separadas para o investimento continuar previsivel."
          />
          <ol className="border-y border-slate-200">
            {[
              "Escolha o modelo inicial e descreva sua rotina.",
              "Defina o setup com os ajustes essenciais.",
              "Valide a demonstracao antes da implantacao.",
              "Mantenha suporte mensal e evolua quando precisar.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4 border-b border-slate-200 py-5 last:border-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-ink-950 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-600 sm:text-base">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-slate-200 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-700">Antes de fechar</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-5xl">
              Descubra qual pacote combina com sua operacao.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Um diagnostico curto evita comprar modulos que sua equipe ainda nao precisa.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/diagnostico"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-brand-600 bg-brand-600 px-5 font-bold text-white hover:border-brand-700 hover:bg-brand-700"
            >
              <ClipboardList className="size-5" />
              Fazer diagnostico
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 font-bold hover:border-emerald-300 hover:bg-emerald-50"
            >
              <MessageCircle className="size-5" />
              Tirar uma duvida
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileWhatsAppCta href={whatsappHref} label="Tirar duvida no WhatsApp" />
    </main>
  );
}
