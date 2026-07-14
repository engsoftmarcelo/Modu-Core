import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  LayoutDashboard,
  MessageCircle,
  MousePointerClick,
  Settings2,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";
import { getSalesWhatsAppHref } from "@/lib/sales-whatsapp";

import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Apresentacao comercial",
  description:
    "Apresentacao comercial da ModuCore com problema, solucao, prints, implantacao, preco e proximos passos.",
};

const whatsappHref = getSalesWhatsAppHref(
  "Ola! Vi a apresentacao comercial da ModuCore e quero conversar sobre meu sistema.",
);

const problems = [
  "Atendimentos e vendas ficam espalhados entre WhatsApp, caderno e planilha.",
  "O retorno ao cliente depende da memoria de quem atendeu.",
  "A empresa perde tempo procurando historico, valores, servicos e proximos passos.",
];

const solutionItems = [
  {
    title: "CRM",
    text: "Clientes, leads, propostas, tarefas e acompanhamento comercial.",
    icon: UsersRound,
  },
  {
    title: "Agenda",
    text: "Servicos, horarios, confirmacao por WhatsApp e comparecimento.",
    icon: CalendarCheck2,
  },
  {
    title: "Historico",
    text: "Agendamentos passados, observacoes, servicos feitos e proximo retorno.",
    icon: ClipboardList,
  },
];

const deployment = [
  "Diagnostico rapido do problema e do fluxo atual.",
  "Escolha do modelo inicial: Agenda, CRM, cobranca, OS ou matricula.",
  "Personalizacao basica de campos, textos e visual.",
  "Treinamento do responsavel e entrega da primeira versao.",
];

const priceRows = [
  {
    name: "Setup simples",
    price: "R$ 497 a R$ 997",
    detail: "Instalacao, personalizacao basica e treinamento.",
  },
  {
    name: "Mensalidade",
    price: "R$ 97 a R$ 297/mes",
    detail: "Hospedagem, suporte e ajustes pequenos.",
  },
  {
    name: "Customizacao",
    price: "Sob orcamento",
    detail: "Modulos especificos para regras do negocio.",
  },
];

const nextSteps = [
  "Preencher diagnostico do negocio.",
  "Validar quais modulos entram na primeira entrega.",
  "Fechar setup inicial e colocar a demo com dados reais.",
  "Manter suporte mensal para evoluir sem recomecar.",
];

export default function CommercialPresentationPage() {
  return (
    <main className="bg-slate-50 pb-24 text-ink-950 print:bg-white sm:pb-0">
      <section className="bg-ink-950 text-white print:bg-white print:text-ink-950">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10 print:px-0">
          <Logo className="[&_span:last-child]:text-white print:[&_span:last-child]:text-ink-950" />
          <div className="flex items-center gap-3 print:hidden">
            <Link
              href="/diagnostico"
              className="hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15 sm:inline-flex"
            >
              <ArrowLeft className="size-4" />
              Diagnostico
            </Link>
            <div className="hidden sm:block">
              <PrintButton />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-14 print:px-0 print:pb-8 print:pt-4">
          <Badge className="border border-white/10 bg-white/10 text-brand-100 print:border-slate-200 print:bg-slate-50 print:text-brand-700">
            <Sparkles className="mr-1.5 size-3.5" />
            Apresentacao comercial
          </Badge>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl print:text-4xl">
            Apresentacao mobile-first para vender sistemas pelo WhatsApp.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg print:text-slate-600">
            Uma proposta curta, visual e pronta para pequenos negocios que
            operam por redes sociais, mensagens e atendimento pelo celular.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 shadow-lg shadow-black/15 transition hover:bg-brand-50"
            >
              Chamar no WhatsApp
              <MessageCircle className="size-5" />
            </a>
            <Link
              href="/precos"
              className="hidden min-h-14 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-base font-bold text-white transition hover:bg-white/15 sm:inline-flex"
            >
              Ver precos
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <PresentationSection
        kicker="Problema do cliente"
        title="A rotina cresce, mas o controle continua improvisado."
        text="Quando vendas, agenda, servicos e cobranca ficam separados, o dono do negocio passa mais tempo procurando informacao do que atendendo ou vendendo."
        icon={Clock3}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {problems.map((problem) => (
            <div key={problem} className="rounded-2xl border border-slate-200 bg-white p-5">
              <Target className="mb-4 size-6 text-amber-600" />
              <p className="text-sm leading-6 text-slate-600">{problem}</p>
            </div>
          ))}
        </div>
      </PresentationSection>

      <PresentationSection
        kicker="Solucao"
        title="Um sistema modular montado em cima do processo real."
        text="A ModuCore cria uma primeira versao enxuta, com os modulos certos para organizar atendimento, vendas e relacionamento sem inflar o projeto."
        icon={Settings2}
        muted
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {solutionItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </PresentationSection>

      <PresentationSection
        kicker="Prints"
        title="Telas pensadas para demonstrar valor rapido."
        text="A apresentacao mostra o produto funcionando: dashboard, CRM e agenda com dados que o cliente entende na hora."
        icon={LayoutDashboard}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <SystemPrint title="Dashboard" icon={LayoutDashboard} variant="dashboard" />
          <SystemPrint title="CRM" icon={UsersRound} variant="crm" />
          <SystemPrint title="Agenda" icon={CalendarCheck2} variant="agenda" />
        </div>
      </PresentationSection>

      <PresentationSection
        kicker="Processo de implantacao"
        title="Comecar pequeno, validar rapido e evoluir com clareza."
        text="O foco e colocar a primeira versao em uso sem transformar a venda em um projeto longo demais para decidir."
        icon={ClipboardCheck}
        muted
      >
        <div className="grid gap-3 lg:grid-cols-4">
          {deployment.map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-ink-950 text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="mt-4 text-sm leading-6 text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </PresentationSection>

      <PresentationSection
        kicker="Preco"
        title="Uma oferta simples para entrada, manutencao e evolucao."
        text="O cliente entende o investimento inicial, a recorrencia de suporte e quando faz sentido orcar modulos especificos."
        icon={BadgeDollarSign}
      >
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {priceRows.map((row) => (
            <div
              key={row.name}
              className="grid gap-3 border-b border-slate-200 p-5 last:border-b-0 md:grid-cols-[220px_220px_1fr] md:items-center"
            >
              <h3 className="text-lg font-black">{row.name}</h3>
              <p className="text-xl font-black text-brand-700">{row.price}</p>
              <p className="text-sm leading-6 text-slate-600">{row.detail}</p>
            </div>
          ))}
        </div>
      </PresentationSection>

      <PresentationSection
        kicker="Proximos passos"
        title="Da conversa para a primeira entrega."
        text="A decisao fica mais facil quando o cliente ve o caminho completo: diagnostico, escopo inicial, setup e acompanhamento."
        icon={MousePointerClick}
        muted
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {nextSteps.map((step) => (
              <div
                key={step}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-slate-600">{step}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl bg-ink-950 p-7 text-white print:bg-white print:text-ink-950 print:ring-1 print:ring-slate-200">
            <FileText className="size-10 text-brand-100 print:text-brand-700" />
            <h3 className="mt-5 text-2xl font-black">
              Material pronto para venda.
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-300 print:text-slate-600">
              Use esta pagina em reuniao, compartilhe o link ou salve em PDF
              pelo botao no topo.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-ink-950 transition hover:bg-brand-50 print:hidden"
            >
              Chamar no WhatsApp
              <MessageCircle className="size-5" />
            </a>
          </div>
        </div>
      </PresentationSection>
      <MobileWhatsAppCta href={whatsappHref} label="Falar no WhatsApp" />
    </main>
  );
}

function PresentationSection({
  kicker,
  title,
  text,
  icon: Icon,
  muted = false,
  children,
}: {
  kicker: string;
  title: string;
  text: string;
  icon: typeof Clock3;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`px-5 py-16 sm:px-8 lg:px-10 print:px-0 print:py-8 ${
        muted ? "bg-white" : "bg-slate-50"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-brand-600">
              <Icon className="size-4" />
              {kicker}
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl print:text-3xl">
              {title}
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-8 text-slate-600">{text}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function SystemPrint({
  title,
  icon: Icon,
  variant,
}: {
  title: string;
  icon: typeof LayoutDashboard;
  variant: "dashboard" | "crm" | "agenda";
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="size-5" />
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="h-3 w-28 rounded-full bg-ink-950" />
              <div className="mt-2 h-2 w-40 max-w-full rounded-full bg-slate-200" />
            </div>
            <div className="size-9 rounded-xl bg-emerald-50" />
          </div>
          {variant === "dashboard" ? <DashboardMock /> : null}
          {variant === "crm" ? <CrmMock /> : null}
          {variant === "agenda" ? <AgendaMock /> : null}
        </div>
      </div>
    </article>
  );
}

function DashboardMock() {
  return (
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
        {[0, 1, 2].map((item) => (
          <div key={item} className="mb-2 flex items-center gap-3 rounded-lg bg-white p-2 last:mb-0">
            <div className="size-7 rounded-lg bg-emerald-50" />
            <div className="h-2 flex-1 rounded-full bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CrmMock() {
  return (
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
  );
}

function AgendaMock() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[0, 1, 2, 3, 4].map((day) => (
        <div key={day} className="rounded-xl bg-slate-100 p-2">
          <div className="mb-3 h-2 w-10 rounded-full bg-slate-400" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="mb-2 h-12 rounded-lg bg-violet-50 p-2">
              <div className="h-2 w-10 rounded-full bg-violet-600" />
              <div className="mt-2 h-2 w-8 rounded-full bg-violet-200" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
