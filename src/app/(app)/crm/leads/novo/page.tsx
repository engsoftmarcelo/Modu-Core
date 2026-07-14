import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Target } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { LeadForm } from "@/features/crm/leads/components/lead-form";

export const metadata: Metadata = {
  title: "Novo lead",
};

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CrmTabs />

      <Link
        href="/crm/leads"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para leads
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <Target className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Novo lead
          </h1>
          <p className="mt-1 text-slate-500">
            Registre a oportunidade e defina a primeira etapa do contato.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <LeadForm mode="create" />
      </Card>
    </div>
  );
}
