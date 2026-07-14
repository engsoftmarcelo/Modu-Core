"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { completeWorkOrderAction } from "../actions";
import type {
  WorkOrderCompletionResult,
  WorkOrderStatus,
} from "../types";

type WorkOrderFinishButtonProps = {
  checklistCompleted: number;
  checklistTotal: number;
  className?: string;
  currentStatus: WorkOrderStatus;
  initialApprovedBy?: string | null;
  workOrderId: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const controlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-ink-950 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export function WorkOrderFinishButton({
  checklistCompleted,
  checklistTotal,
  className,
  currentStatus,
  initialApprovedBy,
  workOrderId,
}: WorkOrderFinishButtonProps) {
  const router = useRouter();
  const componentId = useId();
  const approvedByInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<Date | null>(null);
  const [approvedBy, setApprovedBy] = useState(initialApprovedBy ?? "");
  const [finalNotes, setFinalNotes] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    WorkOrderCompletionResult["errors"]
  >({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    approvedByInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (currentStatus === "completed") {
    return (
      <div
        className={cn(
          "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 text-sm font-bold text-emerald-700",
          className,
        )}
      >
        <CheckCircle2 className="size-5" />
        Servico finalizado
      </div>
    );
  }

  if (currentStatus === "cancelled") {
    return (
      <div
        className={cn(
          "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-500",
          className,
        )}
      >
        <Ban className="size-5" />
        Ordem cancelada
      </div>
    );
  }

  const remainingItems = Math.max(0, checklistTotal - checklistCompleted);
  const approvedById = `${componentId}-approved-by`;
  const notesId = `${componentId}-notes`;
  const acceptedId = `${componentId}-accepted`;

  function openDialog() {
    setError("");
    setFieldErrors({});
    setOpenedAt(new Date());
    setIsOpen(true);
  }

  function closeDialog() {
    if (!isPending) {
      setIsOpen(false);
    }
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      closeDialog();
    }
  }

  function submitCompletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    startTransition(async () => {
      const result = await completeWorkOrderAction(workOrderId, {
        accepted,
        approvedBy,
        finalNotes,
      });

      if (result.error) {
        setError(result.error);
        setFieldErrors(result.errors);
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  const dialog =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-end bg-ink-950/55 sm:items-center sm:justify-center sm:p-4"
            onKeyDown={handleDialogKeyDown}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDialog();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${componentId}-title`}
              className="max-h-[calc(100dvh-0.75rem)] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                <div>
                  <h2
                    id={`${componentId}-title`}
                    className="text-lg font-bold text-ink-950"
                  >
                    Confirmar conclusao
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Registre o aceite antes de concluir a O.S.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isPending}
                  aria-label="Fechar confirmacao"
                  title="Fechar"
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-ink-950 disabled:opacity-50"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={submitCompletion}>
                <div className="space-y-5 px-5 py-5 sm:px-6">
                  {remainingItems ? (
                    <div className="flex gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                      <CircleAlert className="mt-0.5 size-5 shrink-0" />
                      Ainda ha {remainingItems} etapa(s) pendente(s) no
                      checklist.
                    </div>
                  ) : null}

                  <label htmlFor={approvedById} className="block">
                    <span className="text-sm font-bold text-ink-950">
                      Nome de quem aprovou
                    </span>
                    <input
                      ref={approvedByInputRef}
                      id={approvedById}
                      value={approvedBy}
                      onChange={(event) => setApprovedBy(event.target.value)}
                      maxLength={160}
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.approvedBy)}
                      className={cn(
                        controlClassName,
                        "mt-2",
                        fieldErrors.approvedBy && "border-red-300",
                      )}
                      placeholder="Nome completo"
                      required
                    />
                    {fieldErrors.approvedBy ? (
                      <span className="mt-1 block text-xs font-semibold text-red-600">
                        {fieldErrors.approvedBy[0]}
                      </span>
                    ) : null}
                  </label>

                  <label htmlFor={notesId} className="block">
                    <span className="text-sm font-bold text-ink-950">
                      Observacao final
                    </span>
                    <textarea
                      id={notesId}
                      value={finalNotes}
                      onChange={(event) => setFinalNotes(event.target.value)}
                      maxLength={2000}
                      rows={4}
                      aria-invalid={Boolean(fieldErrors.finalNotes)}
                      className={cn(
                        controlClassName,
                        "mt-2 resize-y py-3",
                        fieldErrors.finalNotes && "border-red-300",
                      )}
                      placeholder="Resultado do servico, orientacoes ou ressalvas"
                    />
                    {fieldErrors.finalNotes ? (
                      <span className="mt-1 block text-xs font-semibold text-red-600">
                        {fieldErrors.finalNotes[0]}
                      </span>
                    ) : null}
                  </label>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <CalendarClock className="size-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Data e hora
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-ink-950">
                        {openedAt ? dateTimeFormatter.format(openedAt) : ""}
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor={acceptedId}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40",
                      fieldErrors.accepted && "border-red-300 bg-red-50",
                    )}
                  >
                    <input
                      id={acceptedId}
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      className="mt-0.5 size-5 shrink-0 accent-emerald-600"
                    />
                    <span className="text-sm font-semibold leading-6 text-ink-950">
                      Confirmo que o cliente aprovou a conclusao do servico.
                    </span>
                  </label>
                  {fieldErrors.accepted ? (
                    <p className="text-xs font-semibold text-red-600">
                      {fieldErrors.accepted[0]}
                    </p>
                  ) : null}

                  {error ? (
                    <p
                      role="alert"
                      className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                    >
                      <CircleAlert className="size-5 shrink-0" />
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeDialog}
                    disabled={isPending}
                    className="w-full px-3"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-3 !bg-emerald-600 hover:!bg-emerald-700 focus-visible:ring-emerald-500"
                  >
                    {isPending ? (
                      <LoaderCircle className="size-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-5" />
                    )}
                    {isPending ? "Concluindo..." : "Concluir O.S."}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={className}>
      <Button
        size="lg"
        onClick={openDialog}
        className="w-full !bg-emerald-600 shadow-emerald-950/15 hover:!bg-emerald-700 focus-visible:ring-emerald-500"
      >
        <CheckCircle2 className="size-5" />
        Finalizar servico
      </Button>
      {dialog}
    </div>
  );
}
