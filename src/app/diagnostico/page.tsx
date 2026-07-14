import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

import { DiagnosticForm } from "./diagnostic-form";

export const metadata: Metadata = {
  title: "Diagnostico",
  description:
    "Formulario de diagnostico da ModuCore para entender problema, segmento e modulos ideais do sistema.",
};

const highlights = [
  "Entenda o problema principal antes de propor tecnologia.",
  "Descubra se o cliente ainda depende de planilha.",
  "Direcione a conversa para agenda, CRM, cobranca, OS ou matricula.",
];

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero fazer um diagnostico rapido para meu negocio.",
  "#diagnostico",
);

export default function DiagnosticPage() {
  return (
    <main className="bg-slate-50 pb-24 text-ink-950 sm:pb-0">
      <section className="bg-ink-950 text-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Logo className="[&_span:last-child]:text-white" />
          <Link
            href="/apresentacao-comercial"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-ink-950 transition hover:bg-brand-50 sm:inline-flex"
          >
            <ClipboardList className="size-4" />
            Apresentacao
          </Link>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:pb-20 lg:pt-14">
          <div>
            <Badge className="border border-white/10 bg-white/10 text-brand-100">
              <Sparkles className="mr-1.5 size-3.5" />
              Diagnostico comercial
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Descubra qual sistema faz sentido antes de vender.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Responda pelo celular e envie tudo direto no WhatsApp: problema,
              segmento, planilha atual e modulos da primeira proposta.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <ClipboardList className="size-10 text-brand-100" />
            <h2 className="mt-5 text-2xl font-black">
              O diagnostico prepara a oferta.
            </h2>
            <div className="mt-6 space-y-4">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                  {highlight}
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-2xl bg-white p-5 text-ink-950">
              <MessageCircle className="size-8 text-emerald-600" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ao enviar, o site abre o WhatsApp com todas as respostas
                organizadas em uma mensagem pronta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="diagnostico" className="scroll-mt-6 px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-bold uppercase text-brand-600">
              Formulario
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Colete os dados essenciais em poucos minutos.
            </h2>
          </div>
          <DiagnosticForm />
        </div>
      </section>
      <MobileWhatsAppCta href={whatsappHref} label="Conversar no WhatsApp" />
    </main>
  );
}
