import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { MobileWhatsAppCta } from "@/components/ui/mobile-whatsapp-cta";

type ModelFeature = {
  description: string;
  icon: LucideIcon;
  title: string;
};

type ModelPageProps = {
  description: string;
  eyebrow: string;
  features: ModelFeature[];
  flow: string[];
  painDescription: string;
  painPoints: string[];
  painTitle: string;
  screenshot: string;
  screenshotAlt: string;
  screenshotCaption: string;
  title: string;
  tone?: "blue" | "violet";
  whatsappHref: string;
};

const toneClasses = {
  blue: {
    icon: "border-brand-200 bg-brand-50 text-brand-700",
    label: "text-sky-300",
  },
  violet: {
    icon: "border-violet-200 bg-violet-50 text-violet-700",
    label: "text-violet-300",
  },
};

export function ModelPage({
  description,
  eyebrow,
  features,
  flow,
  painDescription,
  painPoints,
  painTitle,
  screenshot,
  screenshotAlt,
  screenshotCaption,
  title,
  tone = "blue",
  whatsappHref,
}: ModelPageProps) {
  return (
    <main className="marketing-shell bg-white pb-24 text-ink-950 sm:pb-0">
      <section className="relative isolate flex min-h-[84svh] overflow-hidden bg-ink-950 text-white">
        <Image
          src={screenshot}
          alt={screenshotAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-left-top"
        />
        <div className="absolute inset-0 bg-ink-950/87" />
        <SiteHeader inverse overlay whatsappHref={whatsappHref} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <p className={`text-sm font-bold ${toneClasses[tone].label}`}>{eyebrow}</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-xl sm:leading-8">
              {description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-5 font-bold text-white hover:border-emerald-800 hover:bg-emerald-800"
              >
                <MessageCircle className="size-5" />
                Pedir demonstracao
              </a>
              <a
                href="#produto"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/30 bg-ink-950/40 px-5 font-bold text-white hover:bg-white/10"
              >
                Ver o sistema
                <ArrowRight className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="O problema"
            title={painTitle}
            description={painDescription}
          />
          <div className="border-y border-slate-200">
            {painPoints.map((point) => (
              <div key={point} className="flex gap-3 border-b border-slate-200 py-5 last:border-0">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p className="text-sm leading-6 text-slate-600 sm:text-base">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="O que vem no modelo"
            title="Um fluxo pronto para demonstrar e adaptar."
            description="Os modulos trabalham juntos para reduzir retrabalho e deixar a proxima acao clara."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5">
                  <span className={`grid size-10 place-items-center rounded-lg border ${toneClasses[tone].icon}`}>
                    <Icon className="size-5" />
                  </span>
                  <h2 className="mt-5 font-bold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="produto" className="scroll-mt-16 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Produto real"
            title="Veja a interface que conduz a rotina."
            description={screenshotCaption}
          />
          <figure className="mt-9 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.10)]">
            <Image
              src={screenshot}
              alt={screenshotAlt}
              width={1600}
              height={1000}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="h-auto w-full"
            />
          </figure>
        </div>
      </section>

      <section className="bg-ink-950 px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            inverse
            eyebrow="Fluxo da demonstracao"
            title="Valor percebido em poucos minutos."
            description="A demo percorre uma historia completa, com inicio, acompanhamento e proximo passo."
          />
          <ol className="border-y border-slate-800">
            {flow.map((step, index) => (
              <li key={step} className="flex gap-4 border-b border-slate-800 py-5 last:border-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-md border border-slate-700 text-sm font-bold text-sky-300">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-200 sm:text-base">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-slate-200 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-700">Proximo passo</p>
            <h2 className="font-display mt-3 max-w-3xl text-3xl leading-tight sm:text-5xl">
              Adapte este modelo para sua empresa.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Conte como voce trabalha hoje e receba uma recomendacao de escopo para a primeira versao.
            </p>
          </div>
          <div className="flex flex-col gap-3">
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
              Ver pacotes
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileWhatsAppCta href={whatsappHref} label="Pedir demonstracao" />
    </main>
  );
}
