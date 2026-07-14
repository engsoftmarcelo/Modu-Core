import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

type LoginPageProps = {
  searchParams: Promise<{ setup?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { setup } = await searchParams;

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase text-brand-600">
          Bem-vindo de volta
        </p>
        <h1 className="font-display text-3xl text-ink-950 sm:text-4xl">
          Entre na sua operacao
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Acompanhe o que precisa de atencao hoje.
        </p>
      </div>

      {setup === "1" && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <DatabaseZap className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Supabase ainda nao configurado</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Preencha o arquivo .env.local e execute a migracao antes do primeiro
              acesso.
            </p>
          </div>
        </div>
      )}

      <LoginForm />
    </>
  );
}
