"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CircleDollarSign,
  Eye,
  ExternalLink,
  GripVertical,
  Megaphone,
  Plus,
  Target,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import { moveLeadStageAction } from "@/features/crm/leads/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import {
  leadKanbanLabels,
  leadKanbanStatuses,
  type Lead,
  type LeadKanbanStatus,
} from "@/features/crm/leads/types";

type LeadKanbanProps = {
  leads: Lead[];
};

type ActionFeedback = {
  message: string;
  tone: "error" | "success";
} | null;

const columnStyles: Record<
  LeadKanbanStatus,
  { accent: string; badge: string; drop: string }
> = {
  new: {
    accent: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
    drop: "border-sky-300 bg-sky-50/80",
  },
  contacted: {
    accent: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
    drop: "border-blue-300 bg-blue-50/80",
  },
  proposal_sent: {
    accent: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700",
    drop: "border-violet-300 bg-violet-50/80",
  },
  negotiation: {
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    drop: "border-amber-300 bg-amber-50/80",
  },
  won: {
    accent: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    drop: "border-emerald-300 bg-emerald-50/80",
  },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatValue(value: number | null) {
  return currencyFormatter.format(value ?? 0);
}

function isKanbanStatus(status: Lead["status"]): status is LeadKanbanStatus {
  return leadKanbanStatuses.some((item) => item === status);
}

export function LeadKanban({ leads }: LeadKanbanProps) {
  const router = useRouter();
  const [items, moveOptimisticLead] = useOptimistic(
    leads.filter((lead) => isKanbanStatus(lead.status)),
    (
      current,
      update: { leadId: string; nextStatus: LeadKanbanStatus },
    ) =>
      current.map((item) =>
        item.id === update.leadId
          ? { ...item, status: update.nextStatus }
          : item,
      ),
  );
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] =
    useState<LeadKanbanStatus | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const [isPending, startTransition] = useTransition();

  if (!items.length) {
    const hasLostLeads = leads.some((lead) => lead.status === "lost");

    return (
      <EmptyState
        icon={Target}
        tone="violet"
        title={
          hasLostLeads
            ? "Nenhuma oportunidade ativa no funil."
            : "Seu funil ainda esta vazio."
        }
        description={
          hasLostLeads
            ? "Cadastre um novo lead para retomar o fluxo comercial ou consulte as oportunidades perdidas."
            : "Cadastre o primeiro lead para acompanhar cada oportunidade do contato inicial ao fechamento."
        }
        primaryAction={{
          href: "/crm/leads/novo",
          icon: Plus,
          label: "Cadastrar primeiro lead",
        }}
        secondaryAction={
          hasLostLeads
            ? {
                href: "/crm/leads?view=list&status=lost",
                icon: Eye,
                label: "Ver leads perdidos",
              }
            : undefined
        }
      />
    );
  }

  function moveLead(leadId: string, nextStatus: LeadKanbanStatus) {
    if (isPending) {
      return;
    }

    const lead = items.find((item) => item.id === leadId);

    if (!lead || lead.status === nextStatus || !isKanbanStatus(lead.status)) {
      setDraggedLeadId(null);
      setDragOverStatus(null);
      return;
    }

    setFeedback(null);
    setDraggedLeadId(null);
    setDragOverStatus(null);

    startTransition(async () => {
      moveOptimisticLead({ leadId, nextStatus });
      const result = await moveLeadStageAction(leadId, nextStatus);

      if (result.error) {
        setFeedback({ message: result.error, tone: "error" });
        return;
      }

      setFeedback({
        message: "Lead movido com sucesso.",
        tone: "success",
      });
      router.refresh();
    });
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    status: LeadKanbanStatus,
  ) {
    event.preventDefault();
    const leadId = event.dataTransfer.getData("text/plain") || draggedLeadId;

    if (leadId) {
      moveLead(leadId, status);
    }
  }

  function handleStatusChange(
    event: ChangeEvent<HTMLSelectElement>,
    leadId: string,
  ) {
    moveLead(leadId, event.currentTarget.value as LeadKanbanStatus);
  }

  return (
    <section aria-label="Pipeline de leads">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Arraste os cards entre as etapas ou use o seletor em cada lead.
        </p>
        <Link
          href="/crm/leads?view=list&status=lost"
          className="text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          Ver leads perdidos
        </Link>
      </div>

      {feedback ? (
        <FeedbackMessage className="mb-4" tone={feedback.tone}>
          {feedback.message}
        </FeedbackMessage>
      ) : null}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max snap-x snap-mandatory gap-4">
          {leadKanbanStatuses.map((status) => {
            const columnLeads = items.filter(
              (lead) => lead.status === status,
            );
            const totalValue = columnLeads.reduce(
              (total, lead) => total + lead.estimated_value,
              0,
            );
            const styles = columnStyles[status];
            const isDragOver = dragOverStatus === status;

            return (
              <div
                key={status}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOverStatus(status);
                }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(event) => handleDrop(event, status)}
                className={`w-[82vw] max-w-[19rem] shrink-0 snap-start rounded-2xl border p-3 transition sm:w-[18rem] ${
                  isDragOver
                    ? styles.drop
                    : "border-slate-200 bg-slate-100/70"
                }`}
              >
                <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className={`h-1 ${styles.accent}`} />
                  <div className="flex items-start justify-between gap-3 p-3">
                    <div>
                      <h2 className="font-bold text-ink-950">
                        {leadKanbanLabels[status]}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatValue(totalValue)} em oportunidades
                      </p>
                    </div>
                    <span
                      className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${styles.badge}`}
                    >
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                <div className="min-h-80 space-y-3">
                  {columnLeads.length > 0 ? (
                    columnLeads.map((lead) => (
                      <article
                        key={lead.id}
                        draggable={!isPending}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", lead.id);
                          setDraggedLeadId(lead.id);
                        }}
                        onDragEnd={() => {
                          setDraggedLeadId(null);
                          setDragOverStatus(null);
                        }}
                        className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md ${
                          draggedLeadId === lead.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical
                            className="mt-0.5 size-4 shrink-0 cursor-grab text-slate-300"
                            aria-hidden="true"
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/crm/leads/${lead.id}`}
                              className="group flex items-start justify-between gap-2 font-bold text-ink-950 transition hover:text-brand-700"
                            >
                              <span className="truncate">{lead.name}</span>
                              <ExternalLink
                                className="mt-0.5 size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100"
                                aria-hidden="true"
                              />
                            </Link>

                            <div className="mt-3 space-y-2 text-xs text-slate-500">
                              {lead.company ? (
                                <p className="flex items-center gap-2">
                                  <Building2
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">
                                    {lead.company}
                                  </span>
                                </p>
                              ) : null}
                              <p className="flex items-center gap-2">
                                <CircleDollarSign
                                  className="size-3.5 shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="font-semibold text-slate-700">
                                  {formatValue(lead.estimated_value)}
                                </span>
                              </p>
                              {lead.source ? (
                                <p className="flex items-center gap-2">
                                  <Megaphone
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate">
                                    {lead.source}
                                  </span>
                                </p>
                              ) : null}
                            </div>

                            <label className="mt-4 block">
                              <span className="sr-only">
                                Mover {lead.name} para outra etapa
                              </span>
                              <select
                                value={lead.status}
                                onChange={(event) =>
                                  handleStatusChange(event, lead.id)
                                }
                                disabled={isPending}
                                className="min-h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
                              >
                                {leadKanbanStatuses.map((option) => (
                                  <option key={option} value={option}>
                                    {leadKanbanLabels[option]}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm text-slate-400">
                      Solte um lead aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
