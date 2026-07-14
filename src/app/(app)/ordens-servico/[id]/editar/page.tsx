import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { WorkOrderForm } from "@/features/ordens-servico/components/work-order-form";
import {
  getWorkOrderById,
  getWorkOrderCustomerOptions,
} from "@/features/ordens-servico/queries";

type EditWorkOrderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditWorkOrderPageProps): Promise<Metadata> {
  const { id } = await params;
  const workOrder = await getWorkOrderById(id);

  return {
    title: workOrder
      ? `Editar ${workOrder.service_type}`
      : "Editar ordem de servico",
  };
}

export default async function EditWorkOrderPage({
  params,
}: EditWorkOrderPageProps) {
  const { id } = await params;
  const [workOrder, customers] = await Promise.all([
    getWorkOrderById(id),
    getWorkOrderCustomerOptions(),
  ]);

  if (!workOrder) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/ordens-servico/${workOrder.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para a ordem
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Pencil className="size-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink-950">Editar ordem</h1>
          <p className="mt-1 text-slate-500">
            Atualize a visita e o andamento de {workOrder.service_type}.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <WorkOrderForm
          customers={customers}
          mode="edit"
          workOrder={workOrder}
        />
      </Card>
    </div>
  );
}
