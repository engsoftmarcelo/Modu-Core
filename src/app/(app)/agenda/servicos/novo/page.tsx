import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Scissors } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/agenda/servicos/components/service-form";

export const metadata: Metadata = { title: "Novo servico" };

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/agenda/servicos"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para servicos
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Scissors className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Novo servico
          </h1>
          <p className="mt-1 text-slate-500">
            Informe a duracao e o preco para usar na agenda.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <ServiceForm mode="create" />
      </Card>
    </div>
  );
}
