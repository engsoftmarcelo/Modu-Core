import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  History,
  MessageCircle,
  RotateCcw,
  Scissors,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

export const metadata: Metadata = {
  title: "Agenda para salao, estetica e atendimento",
  description:
    "Sistema para salao, estetica e atendimento com agenda, confirmacao no WhatsApp e historico de clientes.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Quero ver a demo da Agenda da ModuCore.",
);

const features = [
  {
    title: "Agenda diaria e semanal",
    description:
      "Visualize horarios, atendimentos ativos, cancelados e proximos retornos sem depender de caderno.",
    icon: CalendarCheck2,
  },
  {
    title: "Servicos e profissionais",
    description:
      "Cadastre servicos, duracao, preco, profissionais e especialidades para montar a rotina real.",
    icon: Scissors,
  },
  {
    title: "Confirmacao no WhatsApp",
    description:
      "Mensagens prontas para confirmar, lembrar, reagendar, chamar retorno e cobrar com cuidado.",
    icon: MessageCircle,
  },
  {
    title: "Historico de clientes",
    description:
      "Veja atendimentos passados, servicos feitos, observacoes e o proximo retorno do cliente.",
    icon: History,
  },
];

const painPoints = [
  "Cliente marca pelo WhatsApp, mas o horario nao entra na agenda.",
  "Retorno some depois do atendimento e a recompra fica no improviso.",
  "Profissional nao sabe observacoes importantes do cliente.",
  "Cancelamento, remarcacao e comparecimento ficam sem registro.",
];

const flow = [
  "Cadastre cliente, servico, duracao e profissional.",
  "Crie o agendamento no dia e horario certo.",
  "Envie a confirmacao pronta pelo WhatsApp.",
  "Marque comparecimento e alimente o historico do cliente.",
];

export default function AgendaModelPage() {
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
              Agenda para atendimento
            </Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Agenda simples para confirmar horarios pelo WhatsApp.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Um modelo para negocios que vivem de horario marcado e precisam
              controlar servicos, profissionais, presenca, observacoes e retorno
              sem depender de memoria.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 shadow-lg shadow-black/15 transition hover:bg-brand-50"
              >
                Quero uma demo da Agenda
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

          <AgendaPreview />
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-violet-700">
              O problema
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Atendimento com hora marcada quebra quando agenda e historico
              ficam separados.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Salao, estetica, clinicas leves e prestadores por agenda precisam
              saber quem vem, quem confirmou, o que foi feito e quando chamar de
              volta.
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
            <p className="text-sm font-bold uppercase text-brand-600">
              O que vem no modelo
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Uma agenda pronta para confirmar, atender e manter relacionamento.
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
                  <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
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
            <p className="text-sm font-bold uppercase text-violet-700">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
              Do agendamento ao retorno do cliente.
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
                Comece com uma demo da Agenda e adapte para seu atendimento.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Ideal para saloes, estetica facial, barbearias, terapeutas,
                consultorios leves e negocios que vendem atendimento recorrente.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              {[
                "Agenda diaria e semanal",
                "Cadastro de servicos",
                "Profissionais e especialidades",
                "WhatsApp de confirmacao",
                "Historico do cliente",
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
      <MobileWhatsAppCta href={whatsappHref} label="Pedir demo da Agenda" />
    </main>
  );
}

function AgendaPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-950/15">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Agenda semanal
          </p>
          <h2 className="mt-1 text-xl font-black">Atendimentos</h2>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
          Confirmados
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day, dayIndex) => (
          <div key={day} className="rounded-2xl bg-slate-100 p-2">
            <p className="mb-3 text-xs font-black uppercase text-slate-500">
              {day}
            </p>
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className="mb-2 rounded-xl bg-white p-2 shadow-sm last:mb-0"
              >
                <div className="h-2 w-10 rounded-full bg-violet-600" />
                <div className="mt-2 h-2 w-8 rounded-full bg-slate-300" />
                {slot === dayIndex % 3 ? (
                  <div className="mt-2 h-2 w-12 rounded-full bg-emerald-300" />
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Confirmar", value: "WhatsApp", icon: Send },
          { label: "Cliente", value: "Historico", icon: UserRound },
          { label: "Retorno", value: "30 dias", icon: RotateCcw },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="rounded-2xl border border-slate-200 p-4">
              <Icon className="mb-3 size-5 text-violet-600" />
              <p className="text-xs font-bold uppercase text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-lg font-black">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-violet-50 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 text-violet-700" />
          <div>
            <p className="font-bold text-ink-950">Mensagem pronta</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ola, Ana! Confirmando seu horario de limpeza de pele amanha as
              14:00.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
