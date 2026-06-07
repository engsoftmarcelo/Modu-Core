import { CheckCircle2 } from "lucide-react";

import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -right-20 top-12 size-80 rounded-full bg-violet-500/20 blur-3xl" />

        <Logo href="/login" className="relative [&_span:last-child]:text-white" />

        <div className="relative max-w-xl">
          <span className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-brand-100">
            Feito para pequenos negocios de servico
          </span>
          <h1 className="text-5xl font-bold leading-[1.06] tracking-[-0.05em]">
            Sua operacao organizada, um modulo de cada vez.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Clientes, agenda, propostas e tarefas em uma interface simples para
            quem precisa cuidar do negocio, nao administrar software.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Configuracao guiada",
              "Dados separados por empresa",
              "Pronto para crescer",
              "Pensado para uso no celular",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="size-5 text-violet-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-slate-500">
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
