import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Target,
  UsersRound,
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Apresentacao comercial",
  description:
    "Apresentacao da ModuCore com problema, solucao, produto, implantacao, preco e proximos passos.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Vi a apresentacao da ModuCore e quero conversar sobre meu sistema.",
);

const screenshots = [
  ["/images/product-crm.png", "CRM B2B", "Leads, indicadores e acompanhamento comercial."],
  ["/images/product-agenda.png", "Agenda", "Horarios, equipe e status de atendimento."],
  ["/images/product-work-orders.png", "Ordem de servico", "Checklist, cliente e conclusao em campo."],
] as const;

export default function CommercialPresentationPage() {
  return (
    <main className="marketing-shell bg-white pb-24 text-ink-950 sm:pb-0 print:pb-0">
      <section className="relative isolate flex min-h-[76svh] overflow-hidden bg-ink-950 text-white print:min-h-0 print:bg-white print:text-ink-950">
        <Image
          src="/images/product-dashboard.png"
          alt="Dashboard do ModuCore"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left-top print:hidden"
        />
        <div className="absolute inset-0 bg-ink-950/88 print:hidden" />
        <SiteHeader inverse overlay whatsappHref={whatsappHref} />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20 print:block print:px-0 print:py-10">
          <div className="max-w-4xl">
            <p className="text-sm font-bold text-sky-300 print:text-brand-700">Apresentacao comercial</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] sm:text-6xl lg:text-7xl print:text-5xl">
              ModuCore para pequenos negocios
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8 print:text-slate-600">
              Uma base modular para organizar clientes, vendas, atendimentos e
              equipe sem transformar a implantacao em um projeto interminavel.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row print:hidden">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-5 font-bold text-white hover:border-emerald-800 hover:bg-emerald-800"
              >
                <MessageCircle className="size-5" />
                Conversar sobre o projeto
              </a>
              <PrintButton />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 print:px-0 print:py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Problema do cliente"
              title="A informacao existe, mas nao esta organizada."
              description="Quando a rotina depende de memoria, planilha e conversa solta, o cliente percebe atrasos e a equipe perde contexto."
            />
            <div className="mt-6 border-y border-slate-200">
              {[
                "Vendas e atendimentos espalhados em varios canais.",
                "Retornos esquecidos e propostas sem acompanhamento.",
                "Historico dificil de encontrar quando o cliente volta.",
              ].map((item) => (
                <p key={item} className="border-b border-slate-200 py-4 text-sm leading-6 text-slate-600 last:border-0">
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Solucao"
              title="Um sistema que acompanha o fluxo completo."
              description="Os modulos compartilham a mesma base e deixam a proxima acao visivel."
            />
            <div className="mt-6 grid gap-3">
              {[
                { icon: UsersRound, title: "CRM", text: "Clientes, leads, propostas e tarefas." },
                { icon: CalendarCheck2, title: "Agenda", text: "Servicos, horarios, WhatsApp e comparecimento." },
                { icon: ClipboardList, title: "Historico", text: "Registros, observacoes e proximo retorno." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 border-b border-slate-200 pb-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-bold">{title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 print:bg-white print:px-0 print:py-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Produto"
            title="Telas reais das demonstracoes."
            description="Dados ficticios mostram como cada fluxo funciona na pratica."
          />
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {screenshots.map(([src, title, description]) => (
              <figure key={src} className="overflow-hidden rounded-lg border border-slate-200 bg-white break-inside-avoid">
                <div className="aspect-[16/10] overflow-hidden border-b border-slate-200">
                  <Image
                    src={src}
                    alt={title}
                    width={1600}
                    height={1000}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="h-full w-full object-cover object-left-top"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 print:px-0 print:py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Implantacao"
            title="Entrega curta, validada por etapas."
            description="O primeiro objetivo e colocar um fluxo completo em uso e aprender com a rotina real."
          />
          <ol className="border-y border-slate-200">
            {[
              "Diagnostico do problema e do processo atual.",
              "Escolha do modelo e dos modulos iniciais.",
              "Personalizacao de campos, textos e identidade.",
              "Demonstracao, treinamento e entrega da primeira versao.",
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

      <section className="bg-ink-950 px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10 print:bg-white print:px-0 print:py-10 print:text-ink-950">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            inverse
            eyebrow="Investimento"
            title="Pacotes simples para comecar."
            description="O escopo final define o valor exato, mas a estrutura comercial continua previsivel."
          />
          <div className="mt-9 grid border-y border-slate-800 md:grid-cols-3 print:border-slate-200">
            {[
              ["Setup simples", "R$ 497 a R$ 997", "Instalacao, personalizacao basica e treinamento."],
              ["Mensalidade", "R$ 97 a R$ 297/mes", "Hospedagem, suporte e pequenos ajustes."],
              ["Customizacao", "Sob orcamento", "Modulos e regras especificas."],
            ].map(([name, price, detail]) => (
              <div key={name} className="border-b border-slate-800 py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 print:border-slate-200">
                <p className="text-sm font-bold text-sky-300 print:text-brand-700">{name}</p>
                <p className="mt-2 text-2xl font-bold">{price}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 print:px-0 print:py-10">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-slate-200 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-700">Proximos passos</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-5xl">Vamos definir a primeira versao.</h2>
            <div className="mt-5 flex flex-col gap-2">
              {["Preencher o diagnostico.", "Validar os modulos iniciais.", "Agendar a demonstracao."].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 print:hidden">
            <Link
              href="/diagnostico"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-brand-600 bg-brand-600 px-5 font-bold text-white hover:border-brand-700 hover:bg-brand-700"
            >
              <Target className="size-5" />
              Fazer diagnostico
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 font-bold hover:border-emerald-300 hover:bg-emerald-50"
            >
              Falar no WhatsApp
              <ArrowRight className="size-5" />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileWhatsAppCta href={whatsappHref} label="Conversar sobre o projeto" />
    </main>
  );
}
