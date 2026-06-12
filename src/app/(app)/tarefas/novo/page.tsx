import type { Metadata } from "next";
import { ChevronLeft, ListPlus } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { TaskForm } from "@/features/tarefas/components/task-form";
import { getTaskRelationOptions } from "@/features/tarefas/queries";

export const metadata: Metadata = { title: "Nova tarefa" };

type NewTaskPageProps = {
  searchParams: Promise<{
    customerId?: string;
    leadId?: string;
  }>;
};

export default async function NewTaskPage({
  searchParams,
}: NewTaskPageProps) {
  const [params, options] = await Promise.all([
    searchParams,
    getTaskRelationOptions(),
  ]);
  const customer = options.customers.find(
    (option) => option.id === params.customerId,
  );
  const lead = options.leads.find((option) => option.id === params.leadId);
  const selected = customer ?? lead;
  const initialRelationship = customer
    ? `customer:${customer.id}`
    : lead
      ? `lead:${lead.id}`
      : "";
  const initialTitle = selected ? `Follow-up com ${selected.label}` : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/tarefas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-amber-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para tarefas
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <ListPlus className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ink-950">
            Nova tarefa
          </h1>
          <p className="mt-1 text-slate-500">
            Registre o proximo passo e quando ele precisa acontecer.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-7">
        <TaskForm
          mode="create"
          options={options}
          initialRelationship={initialRelationship}
          initialTitle={initialTitle}
        />
      </Card>
    </div>
  );
}
