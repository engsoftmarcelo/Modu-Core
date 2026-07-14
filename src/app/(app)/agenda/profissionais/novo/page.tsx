import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProfessionalForm } from "@/features/agenda/profissionais/components/professional-form";
import { getServiceOptions } from "@/features/agenda/profissionais/queries";

export const metadata: Metadata = { title: "Novo profissional" };

export default async function NewProfessionalPage() {
  const options = await getServiceOptions();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/agenda/profissionais"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para profissionais
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <UserPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Novo profissional
          </h1>
          <p className="mt-1 text-slate-500">
            Informe a especialidade, o horario e os servicos que realiza.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <ProfessionalForm mode="create" options={options} />
      </Card>
    </div>
  );
}
