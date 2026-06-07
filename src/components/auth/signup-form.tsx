"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  initialAuthState,
  signUpAction,
} from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/auth/submit-button";

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
            Seu nome
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Nome completo"
            className={inputClassName}
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-semibold text-slate-700"
          >
            Nome da empresa
          </label>
          <input
            id="companyName"
            name="companyName"
            autoComplete="organization"
            placeholder="Sua empresa"
            className={inputClassName}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="businessModel"
          className="text-sm font-semibold text-slate-700"
        >
          Modelo principal
        </label>
        <select
          id="businessModel"
          name="businessModel"
          className={inputClassName}
          defaultValue="b2b_services"
        >
          <option value="b2b_services">Servicos B2B</option>
          <option value="appointments">Agenda e atendimento</option>
          <option value="courses">Cursos livres</option>
          <option value="work_orders">Ordem de servico</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            className={inputClassName}
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimo de 8 caracteres"
            className={inputClassName}
            required
          />
        </div>
      </div>

      {state.message && (
        <p
          role="status"
          className={
            state.status === "success"
              ? "rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              : "rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          }
        >
          {state.message}
        </p>
      )}

      <SubmitButton pendingLabel="Criando sua conta...">
        Criar minha empresa
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        Ja usa o ModuCore?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Fazer login
        </Link>
      </p>
    </form>
  );
}
