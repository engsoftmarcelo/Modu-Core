import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ClipboardPlus, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { WorkOrderForm } from "@/features/ordens-servico/components/work-order-form";
import { WorkOrderDemoProgress } from "@/features/ordens-servico/demo/work-order-demo-progress";
import { getWorkOrderCustomerOptions } from "@/features/ordens-servico/queries";

export const metadata: Metadata = { title: "Nova ordem de servico" };

type NewWorkOrderPageProps = {
  searchParams: Promise<{ customerId?: string; demo?: string }>;
};

function saoPauloTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date());
}

export default async function NewWorkOrderPage({
  searchParams,
}: NewWorkOrderPageProps) {
  const [params, customers] = await Promise.all([
    searchParams,
    getWorkOrderCustomerOptions(),
  ]);
  const selectedCustomer = customers.find(
    (customer) => customer.id === params.customerId,
  );
  const demoMode = params.demo === "1";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {demoMode ? <WorkOrderDemoProgress currentStep={1} /> : null}

      <Link
        href={demoMode ? "/ordens-servico/demo" : "/ordens-servico"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        {demoMode ? "Voltar para a demo" : "Voltar para ordens"}
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <ClipboardPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">
            {demoMode ? "Registrar solicitacao" : "Nova ordem"}
          </h1>
          <p className="mt-1 text-slate-500">
            {demoMode
              ? "Confirme os dados recebidos do cliente para iniciar o fluxo."
              : "Registre o cliente, a visita e o tecnico responsavel."}
          </p>
        </div>
      </div>

      {customers.length ? (
        <Card className="p-5 sm:p-7">
          <WorkOrderForm
            customers={customers}
            defaultCustomerId={selectedCustomer?.id ?? ""}
            defaultVisitDate={saoPauloTodayKey()}
            demoMode={demoMode}
            mode="create"
          />
        </Card>
      ) : (
        <Card className="p-6 text-center sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <UserPlus className="size-6" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink-950">
            Cadastre um cliente primeiro
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Toda ordem precisa estar vinculada a um cliente do CRM.
          </p>
          <Link
            href="/crm/novo"
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <UserPlus className="size-4" />
            Cadastrar cliente
          </Link>
        </Card>
      )}
    </div>
  );
}
