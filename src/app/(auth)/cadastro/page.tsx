import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-7">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-brand-600">
          Comece pela base
        </p>
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
          Crie seu espaco no ModuCore
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Escolha o modelo mais proximo da sua operacao. Os modulos continuam
          flexiveis.
        </p>
      </div>

      <SignupForm />
    </>
  );
}
