import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Eye,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { CollectionEmptyState } from "@/components/ui/empty-state";
import { getInitials } from "@/lib/utils";

import type { Customer } from "../types";
import { CustomerStatusBadge } from "./customer-status-badge";

function whatsAppHref(value: string) {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function CustomerList({
  customers,
  count,
  hasFilters = false,
}: {
  customers: Customer[];
  count: number;
  hasFilters?: boolean;
}) {
  if (!customers.length) {
    return (
      <CollectionEmptyState
        hasFilters={hasFilters}
        icon={UserRound}
        tone="blue"
        emptyTitle="Voce ainda nao cadastrou nenhum cliente."
        emptyDescription="Cadastre seu primeiro cliente para comecar a organizar contatos, atendimentos e proximos retornos."
        filteredTitle="Nenhum cliente corresponde a sua busca."
        filteredDescription="Revise o nome, o contato ou o status selecionado e tente novamente."
        createHref="/crm/novo"
        createLabel="Cadastrar primeiro cliente"
        clearHref="/crm"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div>
          <p className="font-bold text-ink-950">
            {count} {count === 1 ? "cliente" : "clientes"}
          </p>
          {count > 100 && (
            <p className="mt-1 text-xs text-slate-500">
              Exibindo os primeiros 100 resultados.
            </p>
          )}
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-5 py-4">Contato</th>
              <th className="px-5 py-4">Segmento</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-brand-50/40"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
                      {getInitials(customer.name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/crm/${customer.id}`}
                        className="font-bold text-ink-950 hover:text-brand-700"
                      >
                        {customer.name}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                        <Building2 className="size-3.5" />
                        {customer.company || "Sem empresa"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    {customer.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="size-3.5 text-slate-400" />
                        {customer.email}
                      </p>
                    )}
                    {(customer.phone || customer.whatsapp) && (
                      <p className="flex items-center gap-2">
                        <Phone className="size-3.5 text-slate-400" />
                        {customer.phone || customer.whatsapp}
                      </p>
                    )}
                    {!customer.email && !customer.phone && !customer.whatsapp && (
                      <span className="text-slate-400">Sem contato</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  {customer.segment || "Nao informado"}
                </td>
                <td className="px-5 py-4">
                  <CustomerStatusBadge status={customer.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/crm/${customer.id}`}
                      aria-label={`Ver ${customer.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-brand-700"
                    >
                      <Eye className="size-[18px]" />
                    </Link>
                    <Link
                      href={`/crm/${customer.id}/editar`}
                      aria-label={`Editar ${customer.name}`}
                      className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-brand-700"
                    >
                      <Pencil className="size-[18px]" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/crm/${customer.id}`}
            className="flex gap-3 p-5 transition hover:bg-brand-50/50"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
              {getInitials(customer.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-950">{customer.name}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {customer.company || "Sem empresa"}
                  </p>
                </div>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                {customer.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {customer.phone}
                  </span>
                )}
                {customer.whatsapp && (
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" />
                    {customer.whatsapp}
                  </span>
                )}
                {customer.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {customer.email}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="mt-2 size-5 shrink-0 text-slate-300" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

export { whatsAppHref };
