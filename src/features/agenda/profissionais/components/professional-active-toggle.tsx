"use client";

import { LoaderCircle, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FeedbackMessage } from "@/components/ui/feedback-message";
import { cn } from "@/lib/utils";

import { updateProfessionalActiveAction } from "../actions";

type ProfessionalActiveToggleProps = {
  active: boolean;
  professionalId: string;
  professionalName: string;
};

type ActionFeedback = {
  message: string;
  tone: "error" | "success";
} | null;

export function ProfessionalActiveToggle({
  active,
  professionalId,
  professionalName,
}: ProfessionalActiveToggleProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfessionalActiveAction(
        professionalId,
        !active,
      );

      if (result.error) {
        setFeedback({ message: result.error, tone: "error" });
        return;
      }

      setFeedback({
        message: "Profissional atualizado com sucesso.",
        tone: "success",
      });
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={`${active ? "Desativar" : "Ativar"} ${professionalName}`}
        className={cn(
          "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60",
          active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
        )}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Power className="size-4" />
        )}
        {isPending ? "Salvando..." : active ? "Ativo" : "Inativo"}
      </button>
      {feedback ? (
        <FeedbackMessage className="mt-2" tone={feedback.tone} variant="inline">
          {feedback.message}
        </FeedbackMessage>
      ) : null}
    </div>
  );
}
