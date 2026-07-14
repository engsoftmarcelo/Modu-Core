import { cache } from "react";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import {
  workOrderAttachmentBucket,
  workOrderAttachmentMaxFiles,
  workOrderStatuses,
  type WorkOrder,
  type WorkOrderAttachmentGalleryItem,
  type WorkOrderDetails,
  type WorkOrderCustomerOption,
  type WorkOrderStatus,
  type WorkOrderWithCustomer,
} from "./types";

export type WorkOrderListFilters = {
  query?: string;
  status?: WorkOrderStatus | "all";
};

const workOrderColumns =
  "id, organization_id, customer_id, professional_id, address, service_type, description, technician_name, visit_date, status, quote_materials, quote_labor, quote_discount, quote_total, quote_term, quoted_at, completion_approved_by, completion_notes, completion_accepted, completed_at, created_at, updated_at";

const workOrderChecklistColumns =
  "id, organization_id, work_order_id, item_key, label, position, completed, completed_at, created_at, updated_at";

const workOrderAttachmentColumns =
  "id, storage_path, file_name, mime_type, file_size, created_at";

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,().:%"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

async function attachCustomers(
  workOrders: WorkOrder[],
  organizationId: string,
): Promise<WorkOrderWithCustomer[]> {
  const customerIds = [
    ...new Set(
      workOrders.flatMap((workOrder) =>
        workOrder.customer_id ? [workOrder.customer_id] : [],
      ),
    ),
  ];

  if (!customerIds.length) {
    return workOrders.map((workOrder) => ({
      ...workOrder,
      customerCompany: null,
      customerName: null,
      customerPhone: null,
      customerWhatsapp: null,
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, company, phone, whatsapp")
    .eq("organization_id", organizationId)
    .in("id", customerIds);

  if (error) {
    throw new Error("Nao foi possivel carregar os clientes das ordens.");
  }

  const customers = new Map(
    (data ?? []).map((customer) => [customer.id, customer]),
  );

  return workOrders.map((workOrder) => {
    const customer = workOrder.customer_id
      ? customers.get(workOrder.customer_id)
      : null;

    return {
      ...workOrder,
      customerCompany: customer?.company ?? null,
      customerName: customer?.name ?? null,
      customerPhone: customer?.phone ?? null,
      customerWhatsapp: customer?.whatsapp ?? null,
    };
  });
}

export async function getWorkOrders(filters: WorkOrderListFilters = {}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { workOrders: [] as WorkOrderWithCustomer[], count: 0 };
  }

  const supabase = await createClient();
  let query = supabase
    .from("work_orders")
    .select(workOrderColumns, { count: "exact" })
    .eq("organization_id", identity.organizationId)
    .order("visit_date", { ascending: true })
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const searchTerm = sanitizeSearchTerm(filters.query ?? "");

  if (searchTerm) {
    query = query.or(
      [
        `service_type.ilike.%${searchTerm}%`,
        `address.ilike.%${searchTerm}%`,
        `description.ilike.%${searchTerm}%`,
        `technician_name.ilike.%${searchTerm}%`,
      ].join(","),
    );
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Nao foi possivel carregar as ordens: ${error.message}`);
  }

  return {
    workOrders: await attachCustomers(data ?? [], identity.organizationId),
    count: count ?? 0,
  };
}

export async function getWorkOrderCustomerOptions(): Promise<
  WorkOrderCustomerOption[]
> {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, company")
    .eq("organization_id", identity.organizationId)
    .order("name")
    .limit(200);

  if (error) {
    throw new Error("Nao foi possivel carregar os clientes.");
  }

  return (data ?? []).map((customer) => ({
    id: customer.id,
    label: customer.company
      ? `${customer.name} - ${customer.company}`
      : customer.name,
  }));
}

export const getWorkOrderById = cache(async function getWorkOrderById(
  workOrderId: string,
): Promise<WorkOrderDetails | null> {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_orders")
    .select(workOrderColumns)
    .eq("id", workOrderId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel carregar a ordem: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [workOrders, checklistResult, attachmentResult] = await Promise.all([
    attachCustomers([data], identity.organizationId),
    supabase
      .from("work_order_checklist_items")
      .select(workOrderChecklistColumns)
      .eq("work_order_id", workOrderId)
      .eq("organization_id", identity.organizationId)
      .order("position", { ascending: true }),
    supabase
      .from("work_order_attachments")
      .select(workOrderAttachmentColumns)
      .eq("work_order_id", workOrderId)
      .eq("organization_id", identity.organizationId)
      .eq("upload_status", "ready")
      .order("created_at", { ascending: false })
      .limit(workOrderAttachmentMaxFiles),
  ]);

  if (checklistResult.error) {
    throw new Error(
      `Nao foi possivel carregar o checklist: ${checklistResult.error.message}`,
    );
  }

  if (attachmentResult.error) {
    throw new Error(
      `Nao foi possivel carregar os anexos: ${attachmentResult.error.message}`,
    );
  }

  let attachments: WorkOrderAttachmentGalleryItem[] = [];
  const attachmentRows = attachmentResult.data ?? [];

  if (attachmentRows.length) {
    const { data: signedUrls, error: signedUrlError } = await supabase.storage
      .from(workOrderAttachmentBucket)
      .createSignedUrls(
        attachmentRows.map((attachment) => attachment.storage_path),
        60 * 60,
      );

    if (signedUrlError) {
      throw new Error("Nao foi possivel preparar a galeria de anexos.");
    }

    const signedUrlByPath = new Map(
      (signedUrls ?? []).flatMap((signedFile) =>
        signedFile.path && signedFile.signedUrl
          ? [[signedFile.path, signedFile.signedUrl] as const]
          : [],
      ),
    );

    attachments = attachmentRows.flatMap((attachment) => {
      const signedUrl = signedUrlByPath.get(attachment.storage_path);

      return signedUrl
        ? [
            {
              createdAt: attachment.created_at,
              fileName: attachment.file_name,
              fileSize: attachment.file_size,
              id: attachment.id,
              mimeType: attachment.mime_type,
              signedUrl,
            },
          ]
        : [];
    });
  }

  const [workOrder] = workOrders;

  return workOrder
    ? {
        ...workOrder,
        attachments,
        checklistItems: checklistResult.data ?? [],
      }
    : null;
});

export function isWorkOrderStatus(
  value: string | undefined,
): value is WorkOrderStatus {
  return workOrderStatuses.includes(value as WorkOrderStatus);
}
