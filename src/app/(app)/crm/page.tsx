import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Plus, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { CustomerList } from "@/features/crm/customers/components/customer-list";
import { CustomerSearch } from "@/features/crm/customers/components/customer-search";
import { getCustomers } from "@/features/crm/customers/queries";
import type { CustomerStatus } from "@/features/crm/customers/types";

export const metadata: Metadata = { title: "Clientes" };

type CrmPageProps = {
  searchParams: Promise<{
    deleted?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().slice(0, 80);
  const status: CustomerStatus | "all" =
    params.status === "active" || params.status === "inactive"
      ? params.status
      : "all";
  const { customers, count } = await getCustomers({ query, status });

  return (
    <div className="space-y-6">
      <CrmTabs />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="blue">
            <UsersRound className="mr-1.5 size-3.5" />
            CRM
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink-950 sm:text-4xl">
            Clientes
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
            Centralize contatos, empresas e informacoes importantes da sua base.
          </p>
        </div>

        <Link
          href="/crm/novo"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700"
        >
          <Plus className="size-5" />
          Novo cliente
        </Link>
      </div>

      {params.deleted === "1" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          Cliente excluido com sucesso.
        </div>
      )}

      <CustomerSearch query={query} status={status} />
      <CustomerList customers={customers} count={count} />
    </div>
  );
}
