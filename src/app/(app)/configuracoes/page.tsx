import type { Metadata } from "next";
import { Building2, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getWorkspaceIdentity } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Configuracoes",
};

export default async function SettingsPage() {
  const identity = await getWorkspaceIdentity();

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <Badge tone="blue">Conta e empresa</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
          Configuracoes
        </h1>
        <p className="mt-2 text-slate-500">
          Informacoes basicas do seu espaco no ModuCore.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Building2 className="size-5" />
            </span>
            <div>
              <h2 className="font-bold text-ink-950">Empresa</h2>
              <p className="text-sm text-slate-500">Dados do espaco de trabalho</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Nome
            </p>
            <p className="mt-2 font-semibold text-ink-950">
              {identity?.organizationName}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Seguranca
            </p>
            <p className="mt-2 inline-flex items-center gap-2 font-semibold text-emerald-700">
              <ShieldCheck className="size-4" />
              Dados isolados por organizacao
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <UserRound className="size-5" />
            </span>
            <div>
              <h2 className="font-bold text-ink-950">Seu perfil</h2>
              <p className="text-sm text-slate-500">Identidade usada no sistema</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Nome
            </p>
            <p className="mt-2 font-semibold text-ink-950">{identity?.fullName}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              E-mail
            </p>
            <p className="mt-2 font-semibold text-ink-950">{identity?.email}</p>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-bold text-ink-950">Encerrar sessao</p>
          <p className="mt-1 text-sm text-slate-500">
            Voce precisara entrar novamente para acessar a empresa.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="danger">
            <LogOut className="size-4" />
            Sair do ModuCore
          </Button>
        </form>
      </Card>
    </div>
  );
}
