import type { Database } from "@/types/database";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadStatus = Lead["status"];

export type LeadFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialLeadFormState: LeadFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const leadStatuses: LeadStatus[] = [
  "new",
  "contacted",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
];

export const leadKanbanStatuses = [
  "new",
  "contacted",
  "proposal_sent",
  "negotiation",
  "won",
] as const satisfies readonly LeadStatus[];

export type LeadKanbanStatus = (typeof leadKanbanStatuses)[number];

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Em contato",
  proposal_sent: "Proposta enviada",
  negotiation: "Negociacao",
  won: "Fechado",
  lost: "Perdido",
};

export const leadKanbanLabels: Record<LeadKanbanStatus, string> = {
  new: "Novo",
  contacted: "Contato",
  proposal_sent: "Proposta",
  negotiation: "Negociacao",
  won: "Fechado",
};

export const leadStatusTones: Record<
  LeadStatus,
  "blue" | "violet" | "amber" | "green" | "red"
> = {
  new: "blue",
  contacted: "violet",
  proposal_sent: "amber",
  negotiation: "violet",
  won: "green",
  lost: "red",
};
