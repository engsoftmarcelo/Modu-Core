import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProfessionalForm } from "@/features/agenda/profissionais/components/professional-form";
import {
  getProfessionalById,
  getServiceOptions,
} from "@/features/agenda/profissionais/queries";

type EditProfessionalPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditProfessionalPageProps): Promise<Metadata> {
  const { id } = await params;
  const professional = await getProfessionalById(id);

  return {
    title: professional ? `Editar ${professional.name}` : "Editar profissional",
  };
}

export default async function EditProfessionalPage({
  params,
}: EditProfessionalPageProps) {
  const { id } = await params;
  const [professional, options] = await Promise.all([
    getProfessionalById(id),
    getServiceOptions(),
  ]);

  if (!professional) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/agenda/profissionais/${professional.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o profissional
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Editar profissional
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize os dados e os servicos de {professional.name}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <ProfessionalForm
          mode="edit"
          professional={professional}
          options={options}
        />
      </Card>
    </div>
  );
}
