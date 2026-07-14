import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/agenda/servicos/components/service-form";
import { getServiceById } from "@/features/agenda/servicos/queries";

type EditServicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditServicePageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);

  return { title: service ? `Editar ${service.name}` : "Editar servico" };
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/agenda/servicos/${service.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o servico
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar servico
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize a duracao, o preco e a situacao de {service.name}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <ServiceForm mode="edit" service={service} />
      </Card>
    </div>
  );
}
