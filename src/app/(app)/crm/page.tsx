import type { Metadata } from "next";
import { Plus, UsersRound } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
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

      <PageHeader
        eyebrow="CRM"
        icon={UsersRound}
        title="Clientes"
        description="Centralize contatos, empresas e informacoes importantes da sua base."
        actions={[{ href: "/crm/novo", icon: Plus, label: "Novo cliente" }]}
      />

      {params.deleted === "1" && (
        <Notice tone="success">Cliente excluido com sucesso.</Notice>
      )}

      <CustomerSearch query={query} status={status} />
      <CustomerList
        customers={customers}
        count={count}
        hasFilters={Boolean(query) || status !== "all"}
      />
    </div>
  );
}
