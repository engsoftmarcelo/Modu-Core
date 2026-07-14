import type { Database } from "@/types/database";

export type WorkOrder = Database["public"]["Tables"]["work_orders"]["Row"];

export type WorkOrderStatus = WorkOrder["status"];

export type WorkOrderWithCustomer = WorkOrder & {
  customerCompany: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerWhatsapp: string | null;
};

export type WorkOrderChecklistItem =
  Database["public"]["Tables"]["work_order_checklist_items"]["Row"];

export type WorkOrderChecklistItemKey = WorkOrderChecklistItem["item_key"];

export type WorkOrderAttachment =
  Database["public"]["Tables"]["work_order_attachments"]["Row"];

export type WorkOrderAttachmentMimeType = WorkOrderAttachment["mime_type"];

export type WorkOrderAttachmentGalleryItem = {
  createdAt: string;
  fileName: string;
  fileSize: number;
  id: string;
  mimeType: WorkOrderAttachmentMimeType;
  signedUrl: string;
};

export type WorkOrderDetails = WorkOrderWithCustomer & {
  attachments: WorkOrderAttachmentGalleryItem[];
  checklistItems: WorkOrderChecklistItem[];
};

export const workOrderAttachmentBucket = "work-order-attachments";
export const workOrderAttachmentMaxBytes = 5 * 1024 * 1024;
export const workOrderAttachmentMaxFiles = 20;
export const workOrderAttachmentMaxBatch = 6;
export const workOrderAttachmentMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies readonly WorkOrderAttachmentMimeType[];

export type WorkOrderAttachmentUploadInput = {
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export type WorkOrderAttachmentUploadPreparation = {
  attachmentId: string;
  path: string;
  token: string;
};

export type WorkOrderAttachmentPrepareResult = {
  error: string | null;
  upload?: WorkOrderAttachmentUploadPreparation;
};

export type WorkOrderAttachmentMutationResult = {
  error: string | null;
};

export const workOrderChecklistItemKeys = [
  "arrived_on_site",
  "assessed_problem",
  "took_photos",
  "performed_service",
  "customer_approved",
  "finished",
] as const satisfies readonly WorkOrderChecklistItemKey[];

export const workOrderChecklistDefaults = [
  { itemKey: "arrived_on_site", label: "Chegou ao local", position: 1 },
  { itemKey: "assessed_problem", label: "Avaliou o problema", position: 2 },
  { itemKey: "took_photos", label: "Tirou fotos", position: 3 },
  { itemKey: "performed_service", label: "Executou o servico", position: 4 },
  { itemKey: "customer_approved", label: "Cliente aprovou", position: 5 },
  { itemKey: "finished", label: "Finalizou", position: 6 },
] as const satisfies readonly {
  itemKey: WorkOrderChecklistItemKey;
  label: string;
  position: number;
}[];

export type WorkOrderChecklistUpdateResult = {
  completedAt?: string | null;
  error: string | null;
};

export type WorkOrderCompletionInput = {
  accepted: boolean;
  approvedBy: string;
  finalNotes: string;
};

export type WorkOrderCompletionField = keyof WorkOrderCompletionInput;

export type WorkOrderCompletionResult = {
  completedAt?: string;
  error: string | null;
  errors: Partial<Record<WorkOrderCompletionField, string[]>>;
};

export type WorkOrderCustomerOption = {
  id: string;
  label: string;
};

export type WorkOrderFormState = {
  status: "idle" | "error";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialWorkOrderFormState: WorkOrderFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export type WorkOrderQuoteFormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export const initialWorkOrderQuoteFormState: WorkOrderQuoteFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export function calculateWorkOrderQuoteTotal(
  materials: number,
  labor: number,
  discount: number,
) {
  const totalInCents =
    Math.round(materials * 100) +
    Math.round(labor * 100) -
    Math.round(discount * 100);

  return Math.max(0, totalInCents) / 100;
}

export const workOrderStatuses = [
  "requested",
  "quoted",
  "approved",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  requested: "Solicitada",
  quoted: "Orcada",
  approved: "Aprovada",
  in_progress: "Em execucao",
  completed: "Concluida",
  cancelled: "Cancelada",
};

export const workOrderStatusTones: Record<
  WorkOrderStatus,
  "amber" | "blue" | "green" | "red" | "slate" | "violet"
> = {
  requested: "slate",
  quoted: "amber",
  approved: "blue",
  in_progress: "violet",
  completed: "green",
  cancelled: "red",
};
