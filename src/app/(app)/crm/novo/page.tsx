import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { CustomerForm } from "@/features/crm/customers/components/customer-form";

export const metadata: Metadata = {
  title: "Novo cliente",
};

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CrmTabs />

      <Link
        href="/crm"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para clientes
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <UserPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            Novo cliente
          </h1>
          <p className="mt-1 text-slate-500">
            Preencha o essencial. Voce pode completar os dados depois.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <CustomerForm mode="create" />
      </Card>
    </div>
  );
}
