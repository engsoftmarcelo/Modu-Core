"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateProposalStatusAction } from "../actions";
import {
  proposalStatusLabels,
  proposalStatuses,
  type ProposalStatus,
} from "../types";

type ProposalStatusSelectProps = {
  initialStatus: ProposalStatus;
  proposalId: string;
  proposalTitle: string;
};

export function ProposalStatusSelect({
  initialStatus,
  proposalId,
  proposalTitle,
}: ProposalStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: ProposalStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setError("");

    startTransition(async () => {
      const result = await updateProposalStatusAction(proposalId, nextStatus);

      if (result.error) {
        setStatus(previousStatus);
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <label>
        <span className="sr-only">Status de {proposalTitle}</span>
        <select
          value={status}
          onChange={(event) =>
            handleChange(event.target.value as ProposalStatus)
          }
          disabled={isPending}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
        >
          {proposalStatuses.map((proposalStatus) => (
            <option key={proposalStatus} value={proposalStatus}>
              {proposalStatusLabels[proposalStatus]}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
