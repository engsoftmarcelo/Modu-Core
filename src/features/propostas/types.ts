import type { Database } from "@/types/database";

export type Proposal = Database["public"]["Tables"]["proposals"]["Row"];
export type ProposalStatus = Proposal["status"];

export type ProposalWithCustomer = Proposal & {
  customerName: string | null;
};

export type ProposalCustomerOption = {
  id: string;
  label: string;
};

export type ProposalFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialProposalFormState: ProposalFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const proposalStatuses: ProposalStatus[] = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
];

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
};

export const proposalStatusTones: Record<
  ProposalStatus,
  "slate" | "blue" | "green" | "red" | "amber"
> = {
  draft: "slate",
  sent: "blue",
  accepted: "green",
  rejected: "red",
  expired: "amber",
};
