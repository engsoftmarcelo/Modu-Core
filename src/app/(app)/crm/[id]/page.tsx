import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarClock,
  ChevronLeft,
  Mail,
  MessageCircle,
  ListPlus,
  Pencil,
  Phone,
  Tag,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import { CrmTabs } from "@/features/crm/crm-tabs";
import { CustomerHistory } from "@/features/crm/customers/components/customer-history";
import { DeleteCustomerButton } from "@/features/crm/customers/components/delete-customer-button";
import { CustomerStatusBadge } from "@/features/crm/customers/components/customer-status-badge";
import {
  getCustomerById,
  getCustomerHistory,
} from "@/features/crm/customers/queries";
import { formatDateTime, getInitials } from "@/lib/utils";

type CustomerDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export async function generateMetadata({
  params,
}: CustomerDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const customer = await getCustomerById(id);

  return {
    title: customer?.name ?? "Cliente",
  };
}

function whatsAppHref(value: string) {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export default async function CustomerDetailsPage({
  params,
  searchParams,
}: CustomerDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const [customer, history] = await Promise.all([
    getCustomerById(id),
    getCustomerHistory(id),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CrmTabs />

      <Link
        href="/crm"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ChevronLeft className="size-4" />
        Voltar para clientes
      </Link>

      {(notice.created === "1" || notice.updated === "1") && (
        <FeedbackMessage tone="success">
          {notice.created === "1"
            ? "Cliente cadastrado com sucesso."
            : "Cliente atualizado com sucesso."}
        </FeedbackMessage>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-700">
            {getInitials(customer.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold text-ink-950 sm:text-4xl">
                {customer.name}
              </h1>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-slate-500">
              <Building2 className="size-4" />
              {customer.company || "Empresa nao informada"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/tarefas/novo?customerId=${customer.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
          >
            <ListPlus className="size-4" />
            Criar follow-up
          </Link>
          <Link
            href={`/crm/${customer.id}/editar`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Pencil className="size-4" />
            Editar cliente
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-ink-950">Contato</h2>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <ContactItem
                icon={Phone}
                label="Telefone"
                value={customer.phone}
                href={customer.phone ? `tel:${customer.phone}` : undefined}
              />
              <ContactItem
                icon={MessageCircle}
                label="WhatsApp"
                value={customer.whatsapp}
                href={
                  customer.whatsapp
                    ? whatsAppHref(customer.whatsapp)
                    : undefined
                }
                external
              />
              <ContactItem
                icon={Mail}
                label="E-mail"
                value={customer.email}
                href={customer.email ? `mailto:${customer.email}` : undefined}
              />
              <ContactItem
                icon={Tag}
                label="Segmento"
                value={customer.segment}
              />
            </div>
          </Card>

          <CustomerHistory customerNotes={customer.notes} history={history} />
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Registro</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <UserRound className="mt-0.5 size-5 text-brand-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Criado em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(customer.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 text-violet-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Ultima atualizacao
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(customer.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-red-100 p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A exclusao remove o cliente da base e desvincula seus registros
              relacionados.
            </p>
            <div className="mt-5">
              <DeleteCustomerButton
                customerId={customer.id}
                customerName={customer.name}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type ContactItemProps = {
  external?: boolean;
  href?: string;
  icon: typeof Phone;
  label: string;
  value: string | null;
};

function ContactItem({
  external,
  href,
  icon: Icon,
  label,
  value,
}: ContactItemProps) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-950">
          {value || "Nao informado"}
        </p>
      </div>
    </>
  );

  if (href && value) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="flex items-center gap-3 bg-white p-5 transition hover:bg-brand-50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3 bg-white p-5">{content}</div>;
}
