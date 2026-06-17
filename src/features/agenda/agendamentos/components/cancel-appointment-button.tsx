"use client";

import { CalendarX, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { updateAppointmentStatusAction } from "../actions";

type CancelAppointmentButtonProps = {
  appointmentId: string;
  appointmentTitle: string;
};

export function CancelAppointmentButton({
  appointmentId,
  appointmentTitle,
}: CancelAppointmentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  function handleCancel() {
    setError("");
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(
        appointmentId,
        "cancelled",
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setIsConfirming(false);
      router.refresh();
    });
  }

  if (isConfirming) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-900">
          Cancelar {appointmentTitle}?
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-800">
          O agendamento fica marcado como cancelado, mas continua no historico.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="danger"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CalendarX className="size-4" />
            )}
            {isPending ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
          >
            Voltar
          </Button>
        </div>
        {error ? (
          <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => setIsConfirming(true)}
      className="w-full sm:w-auto"
    >
      <CalendarX className="size-4" />
      Cancelar agendamento
    </Button>
  );
}
