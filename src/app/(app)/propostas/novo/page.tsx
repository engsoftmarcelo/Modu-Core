import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, FilePlus2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProposalForm } from "@/features/propostas/components/proposal-form";
import { getProposalCustomerOptions } from "@/features/propostas/queries";

export const metadata: Metadata = { title: "Nova proposta" };

type NewProposalPageProps = {
  searchParams: Promise<{
    customerId?: string;
  }>;
};

export default async function NewProposalPage({
  searchParams,
}: NewProposalPageProps) {
  const [params, options] = await Promise.all([
    searchParams,
    getProposalCustomerOptions(),
  ]);
  const customer = options.find((option) => option.id === params.customerId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/propostas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para propostas
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <FilePlus2 className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Nova proposta
          </h1>
          <p className="mt-1 text-slate-500">
            Descreva os servicos, o valor e o prazo de validade da oferta.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <ProposalForm
          mode="create"
          options={options}
          initialCustomerId={customer?.id ?? ""}
        />
      </Card>
    </div>
  );
}
