"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteServiceAction } from "../actions";

type DeleteServiceButtonProps = {
  serviceId: string;
  serviceName: string;
};

export function DeleteServiceButton({
  serviceId,
  serviceName,
}: DeleteServiceButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const result = await deleteServiceAction(serviceId);
      if (result?.error) setError(result.error);
    });
  }

  if (isConfirming) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-800">Excluir {serviceName}?</p>
        <p className="mt-1 text-sm leading-6 text-red-700">
          Esta acao nao pode ser desfeita. Para apenas pausar o servico, use a
          opcao Inativo.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isPending ? "Excluindo..." : "Confirmar exclusao"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
          >
            Cancelar
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
      variant="danger"
      onClick={() => setIsConfirming(true)}
      className="w-full sm:w-auto"
    >
      <Trash2 className="size-4" />
      Excluir servico
    </Button>
  );
}
