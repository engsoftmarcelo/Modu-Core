"use client";

import { LoaderCircle, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { updateServiceActiveAction } from "../actions";

type ServiceActiveToggleProps = {
  active: boolean;
  serviceId: string;
  serviceName: string;
};

export function ServiceActiveToggle({
  active,
  serviceId,
  serviceName,
}: ServiceActiveToggleProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setError("");
    startTransition(async () => {
      const result = await updateServiceActiveAction(serviceId, !active);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={`${active ? "Desativar" : "Ativar"} ${serviceName}`}
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
        {active ? "Ativo" : "Inativo"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
