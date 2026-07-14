import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, MessageCircle } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

import { DiagnosticForm } from "./diagnostic-form";

export const metadata: Metadata = {
  title: "Diagnostico",
  description:
    "Diagnostico da ModuCore para identificar o problema, o segmento e os modulos ideais do sistema.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero fazer um diagnostico rapido para meu negocio.",
  "#diagnostico",
);

export default function DiagnosticPage() {
  return (
    <main className="marketing-shell bg-white pb-24 text-ink-950 sm:pb-0">
      <section className="relative isolate flex min-h-[72svh] overflow-hidden bg-ink-950 text-white">
        <Image
          src="/images/product-crm.png"
          alt="CRM do ModuCore usado como base para o diagnostico"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left-top"
        />
        <div className="absolute inset-0 bg-ink-950/89" />
        <SiteHeader inverse overlay whatsappHref={whatsappHref} />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <p className="text-sm font-bold text-sky-300">Conversa orientada</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
              Diagnostico ModuCore
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8">
              Conte o que mais atrapalha sua rotina e descubra quais modulos
              fazem sentido para a primeira versao do sistema.
            </p>
            <a
              href="#diagnostico"
              className="mt-7 inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-brand-600 bg-brand-600 px-5 font-bold text-white hover:border-brand-700 hover:bg-brand-700"
            >
              Comecar diagnostico
              <ArrowRight className="size-5" />
            </a>
          </div>
        </div>
      </section>

      <section id="diagnostico" className="scroll-mt-16 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Formulario"
            title="O essencial para preparar uma boa proposta."
            description="Leva poucos minutos e organiza as respostas para continuar a conversa no WhatsApp."
          />
          <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <DiagnosticForm />
            <aside className="border-y border-slate-200 py-6 lg:sticky lg:top-24">
              <ClipboardList className="size-8 text-brand-700" />
              <h2 className="mt-4 text-lg font-bold">O que vamos entender</h2>
              <div className="mt-4">
                {[
                  "Seu segmento e o tamanho do problema atual.",
                  "Se a equipe ainda depende de planilha.",
                  "Quais modulos resolvem o primeiro fluxo.",
                  "Qual demonstracao faz mais sentido mostrar.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 border-b border-slate-200 py-3 last:border-0">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/precos"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800"
              >
                Consultar pacotes
                <ArrowRight className="size-4" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-y border-slate-200 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">Prefere explicar por mensagem?</p>
            <p className="mt-1 text-sm text-slate-600">Converse diretamente e receba orientacao sobre o modelo inicial.</p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-5 font-bold text-white hover:border-emerald-800 hover:bg-emerald-800"
          >
            <MessageCircle className="size-5" />
            Conversar no WhatsApp
          </a>
        </div>
      </section>

      <SiteFooter />
      <MobileWhatsAppCta href={whatsappHref} label="Conversar no WhatsApp" />
    </main>
  );
}
