"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/(auth)/actions";
import { initialAuthState } from "@/app/(auth)/auth-state";
import { SubmitButton } from "@/components/auth/submit-button";

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@suaempresa.com.br"
          className={inputClassName}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Senha
          </label>
          <span className="text-xs font-medium text-slate-400">Min. 8 caracteres</span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          className={inputClassName}
          required
        />
      </div>

      {state.message && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.message}
        </p>
      )}

      <SubmitButton pendingLabel="Entrando...">Entrar no ModuCore</SubmitButton>

      <p className="text-center text-sm text-slate-500">
        Ainda nao tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-700 hover:underline">
          Comece agora
        </Link>
      </p>
    </form>
  );
}
