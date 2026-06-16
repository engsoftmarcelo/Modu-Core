"use client";

import { LoaderCircle, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { updateProfessionalActiveAction } from "../actions";

type ProfessionalActiveToggleProps = {
  active: boolean;
  professionalId: string;
  professionalName: string;
};

export function ProfessionalActiveToggle({
  active,
  professionalId,
  professionalName,
}: ProfessionalActiveToggleProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setError("");
    startTransition(async () => {
      const result = await updateProfessionalActiveAction(
        professionalId,
        !active,
      );

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
