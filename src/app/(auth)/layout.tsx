import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.82fr)]">
      <section className="relative isolate hidden overflow-hidden border-r border-slate-800 bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/images/product-dashboard.png"
          alt="Dashboard do ModuCore"
          fill
          priority
          sizes="55vw"
          className="z-0 object-cover object-left-top"
        />
        <div className="absolute inset-0 z-0 bg-ink-950/90" />
        <Logo href="/login" inverse className="relative z-10" />

        <div className="relative z-10 max-w-xl">
          <span className="mb-6 inline-flex rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-sky-200">
            Feito para pequenos negocios de servico
          </span>
          <h2 className="font-display text-5xl leading-[1.08]">
            Sua operacao organizada, um modulo de cada vez.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Clientes, agenda, propostas e tarefas em uma interface simples para
            quem precisa cuidar do negocio, nao administrar software.
          </p>

          <div className="mt-10 grid gap-x-8 gap-y-4 border-t border-slate-800 pt-8 sm:grid-cols-2">
            {[
              "Configuracao guiada",
              "Dados separados por empresa",
              "Pronto para crescer",
              "Pensado para uso no celular",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="size-5 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-400">
          ModuCore · Belo Horizonte, MG
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-xl">
          <Logo href="/login" className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
