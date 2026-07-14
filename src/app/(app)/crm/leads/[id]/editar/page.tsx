import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { LeadForm } from "@/features/crm/leads/components/lead-form";
import { getLeadById } from "@/features/crm/leads/queries";

type EditLeadPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditLeadPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadById(id);

  return {
    title: lead ? `Editar ${lead.name}` : "Editar lead",
  };
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CrmTabs />

      <Link
        href={`/crm/leads/${lead.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o lead
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar lead
          </h1>
          <p className="mt-1 text-slate-500">Atualize os dados de {lead.name}.</p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <LeadForm mode="edit" lead={lead} />
      </Card>
    </div>
  );
}
