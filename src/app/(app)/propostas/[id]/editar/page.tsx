import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProposalForm } from "@/features/propostas/components/proposal-form";
import {
  getProposalById,
  getProposalCustomerOptions,
} from "@/features/propostas/queries";

type EditProposalPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditProposalPageProps): Promise<Metadata> {
  const { id } = await params;
  const proposal = await getProposalById(id);

  return { title: proposal ? `Editar ${proposal.title}` : "Editar proposta" };
}

export default async function EditProposalPage({
  params,
}: EditProposalPageProps) {
  const { id } = await params;
  const [proposal, options] = await Promise.all([
    getProposalById(id),
    getProposalCustomerOptions(),
  ]);

  if (!proposal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/propostas/${proposal.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para a proposta
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Editar proposta
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize os servicos, o valor e o status de {proposal.title}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <ProposalForm mode="edit" proposal={proposal} options={options} />
      </Card>
    </div>
  );
}
