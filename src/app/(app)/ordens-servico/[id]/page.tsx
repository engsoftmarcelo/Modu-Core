import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  HardHat,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Navigation,
  Pencil,
  Phone,
  ReceiptText,
  UserRound,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  buildTelephoneHref,
  buildWorkOrderWhatsappLink,
} from "@/features/ordens-servico/contact";
import { DeleteWorkOrderButton } from "@/features/ordens-servico/components/delete-work-order-button";
import { WorkOrderAttachments } from "@/features/ordens-servico/components/work-order-attachments";
import { WorkOrderChecklist } from "@/features/ordens-servico/components/work-order-checklist";
import { WorkOrderFinishButton } from "@/features/ordens-servico/components/work-order-finish-button";
import { WorkOrderQuoteForm } from "@/features/ordens-servico/components/work-order-quote-form";
import { WorkOrderStatusBadge } from "@/features/ordens-servico/components/work-order-status-badge";
import { WorkOrderStatusSelect } from "@/features/ordens-servico/components/work-order-status-select";
import {
  resolveWorkOrderDemoProgress,
  WorkOrderDemoProgress,
} from "@/features/ordens-servico/demo/work-order-demo-progress";
import { getWorkOrderById } from "@/features/ordens-servico/queries";
import { getWorkspaceIdentity } from "@/lib/auth";
import { canAdministerWorkspace } from "@/lib/permissions";
import { formatDate, formatDateTime } from "@/lib/utils";

type WorkOrderDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; demo?: string; updated?: string }>;
};

type QuickActionProps = {
  className: string;
  external?: boolean;
  href: string | null;
  icon: LucideIcon;
  label: string;
};

export async function generateMetadata({
  params,
}: WorkOrderDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const workOrder = await getWorkOrderById(id);

  return { title: workOrder?.service_type ?? "Ordem de servico" };
}

function QuickAction({
  className,
  external,
  href,
  icon: Icon,
  label,
}: QuickActionProps) {
  const content = (
    <>
      <Icon className="size-5" />
      {label}
    </>
  );

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-400"
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}

export default async function WorkOrderDetailsPage({
  params,
  searchParams,
}: WorkOrderDetailsPageProps) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const [workOrder, identity] = await Promise.all([
    getWorkOrderById(id),
    getWorkspaceIdentity(),
  ]);

  if (!workOrder) {
    notFound();
  }

  const reference = workOrder.id.slice(0, 8).toUpperCase();
  const contactPhone = workOrder.customerPhone ?? workOrder.customerWhatsapp;
  const callHref = buildTelephoneHref(contactPhone);
  const whatsappHref = buildWorkOrderWhatsappLink(
    workOrder.customerWhatsapp ?? workOrder.customerPhone,
    {
      address: workOrder.address,
      customerName: workOrder.customerName,
      reference,
      serviceType: workOrder.service_type,
    },
  );
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(workOrder.address)}`;
  const checklistCompleted = workOrder.checklistItems.filter(
    (item) => item.completed,
  ).length;
  const checklistTotal = workOrder.checklistItems.length;
  const demoMode = notice.demo === "1";
  const demoProgress = resolveWorkOrderDemoProgress({
    attachmentCount: workOrder.attachments.length,
    quotedAt: workOrder.quoted_at,
    status: workOrder.status,
  });
  const showCreatedNotice =
    notice.created === "1" &&
    (!demoMode || demoProgress.currentStep === 2);
  const showUpdatedNotice = notice.updated === "1";
  const canDelete = canAdministerWorkspace(identity?.role);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-24 lg:space-y-6 lg:pb-0">
      {demoMode ? (
        <WorkOrderDemoProgress
          completed={demoProgress.completed}
          currentStep={demoProgress.currentStep}
        />
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={demoMode ? "/ordens-servico/demo" : "/ordens-servico"}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
        >
          <ChevronLeft className="size-4" />
          {demoMode ? "Voltar para a demo" : "Voltar para ordens"}
        </Link>
        <span className="text-xs font-bold text-slate-400 sm:hidden">
          OS #{reference}
        </span>
      </div>

      {showCreatedNotice || showUpdatedNotice ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" />
          {showCreatedNotice
            ? demoMode
              ? "Solicitacao registrada. A demo avancou para o orcamento."
              : "Ordem criada com sucesso."
            : "Ordem atualizada com sucesso."}
        </div>
      ) : null}

      <header className="flex items-start justify-between gap-3 sm:items-center sm:gap-5">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 sm:size-16">
            <ClipboardList className="size-6 sm:size-8" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="break-words text-2xl font-bold text-ink-950 sm:text-4xl">
                {workOrder.service_type}
              </h1>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <p className="mt-1.5 hidden text-sm font-semibold text-slate-400 sm:block">
              OS #{reference}
            </p>
          </div>
        </div>

        <Link
          href={`/ordens-servico/${workOrder.id}/editar`}
          aria-label="Editar ordem"
          title="Editar ordem"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-sm font-bold text-white shadow-lg shadow-indigo-950/15 transition hover:bg-brand-700 sm:h-12 sm:w-auto sm:gap-2 sm:px-5"
        >
          <Pencil className="size-4" />
          <span className="hidden sm:inline">Editar ordem</span>
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <p className="text-xs font-bold uppercase text-slate-400">
                Cliente
              </p>
              {workOrder.customer_id && workOrder.customerName ? (
                <Link
                  href={`/crm/${workOrder.customer_id}`}
                  className="mt-3 flex items-center gap-3 transition hover:text-emerald-700"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <UserRound className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink-950">
                      {workOrder.customerName}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {workOrder.customerCompany || "Empresa nao informada"}
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  O cliente desta ordem foi removido da base.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:px-6">
              <QuickAction
                href={callHref}
                icon={Phone}
                label="Ligar"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-ink-950 transition hover:border-emerald-200 hover:bg-emerald-50"
              />
              <QuickAction
                href={whatsappHref}
                icon={MessageCircle}
                label="WhatsApp"
                external
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
              />
              {!callHref && !whatsappHref ? (
                <p className="col-span-2 text-xs font-semibold text-slate-400">
                  Nenhum telefone foi cadastrado para este cliente.
                </p>
              ) : null}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <MapPin className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Endereco
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-ink-950">
                    {workOrder.address}
                  </p>
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800"
                  >
                    <Navigation className="size-4" />
                    Abrir no mapa
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2">
              <div className="flex gap-3 bg-white px-5 py-4 sm:px-6">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Data da visita
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDate(workOrder.visit_date)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 bg-white px-5 py-4 sm:px-6">
                <HardHat className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Tecnico responsavel
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink-950">
                    {workOrder.technician_name}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <WorkOrderChecklist
            initialItems={workOrder.checklistItems}
            workOrderId={workOrder.id}
          />

          <WorkOrderAttachments
            attachments={workOrder.attachments}
            workOrderId={workOrder.id}
          />

          {workOrder.status === "completed" &&
          workOrder.completion_accepted &&
          workOrder.completion_approved_by &&
          workOrder.completed_at ? (
            <Card className="overflow-hidden border-emerald-200">
              <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-700" />
                  <h2 className="font-bold text-ink-950">
                    Confirmacao de conclusao
                  </h2>
                </div>
                <span className="shrink-0 text-xs font-bold text-emerald-700">
                  Aceite registrado
                </span>
              </div>
              <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
                <div className="flex gap-3 bg-white px-5 py-4 sm:px-6">
                  <UserCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Aprovado por
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-ink-950">
                      {workOrder.completion_approved_by}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 bg-white px-5 py-4 sm:px-6">
                  <CalendarClock className="mt-0.5 size-5 shrink-0 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Data e hora
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink-950">
                      {formatDateTime(workOrder.completed_at)}
                    </p>
                  </div>
                </div>
              </div>
              {workOrder.completion_notes ? (
                <div className="flex gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
                  <MessageSquareText className="mt-0.5 size-5 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Observacao final
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {workOrder.completion_notes}
                    </p>
                  </div>
                </div>
              ) : null}
            </Card>
          ) : null}

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Wrench className="size-5" />
              </span>
              <h2 className="font-bold text-ink-950">Servico solicitado</h2>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {workOrder.description}
            </p>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                  <ReceiptText className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-ink-950">Orcamento da O.S.</h2>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    {workOrder.quoted_at
                      ? `Emitido em ${formatDateTime(workOrder.quoted_at)}`
                      : "Aguardando emissao"}
                  </p>
                </div>
              </div>
              {workOrder.quoted_at ? (
                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Orcamento salvo
                </span>
              ) : null}
            </div>
            <div className="p-5 sm:p-6">
              <WorkOrderQuoteForm
                workOrderId={workOrder.id}
                hasQuote={Boolean(workOrder.quoted_at)}
                initialMaterials={workOrder.quote_materials}
                initialLabor={workOrder.quote_labor}
                initialDiscount={workOrder.quote_discount}
                initialTerm={workOrder.quote_term ?? ""}
              />
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Andamento</h2>
            <div className="mt-5">
              <WorkOrderStatusSelect
                key={workOrder.status}
                initialStatus={workOrder.status}
                serviceType={workOrder.service_type}
                workOrderId={workOrder.id}
              />
            </div>
            <div className="mt-4 hidden border-t border-slate-100 pt-4 lg:block">
              <WorkOrderFinishButton
                checklistCompleted={checklistCompleted}
                checklistTotal={checklistTotal}
                currentStatus={workOrder.status}
                initialApprovedBy={workOrder.customerName}
                workOrderId={workOrder.id}
              />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-ink-950">Registro</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 size-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Criada em
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(workOrder.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 size-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Ultima atualizacao
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-950">
                    {formatDateTime(workOrder.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {canDelete ? (
            <Card className="border-red-100 p-5 sm:p-6">
              <h2 className="font-bold text-ink-950">Zona de cuidado</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A exclusao remove esta ordem definitivamente.
              </p>
              <div className="mt-5">
                <DeleteWorkOrderButton
                  serviceType={workOrder.service_type}
                  workOrderId={workOrder.id}
                />
              </div>
            </Card>
          ) : null}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <WorkOrderFinishButton
          checklistCompleted={checklistCompleted}
          checklistTotal={checklistTotal}
          currentStatus={workOrder.status}
          initialApprovedBy={workOrder.customerName}
          workOrderId={workOrder.id}
        />
      </div>
    </div>
  );
}
