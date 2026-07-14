import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { CustomerForm } from "@/features/crm/customers/components/customer-form";
import { getCustomerById } from "@/features/crm/customers/queries";

type EditCustomerPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditCustomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const customer = await getCustomerById(id);

  return {
    title: customer ? `Editar ${customer.name}` : "Editar cliente",
  };
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CrmTabs />

      <Link
        href={`/crm/${customer.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para o cliente
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Editar cliente
          </h1>
          <p className="mt-1 text-slate-500">
            Atualize os dados de {customer.name}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <CustomerForm mode="edit" customer={customer} />
      </Card>
    </div>
  );
}
