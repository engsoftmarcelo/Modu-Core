"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { workOrderAttachmentFileSchema } from "./schema";
import {
  workOrderAttachmentBucket,
  workOrderAttachmentMaxFiles,
  type WorkOrderAttachmentMimeType,
  type WorkOrderAttachmentMutationResult,
  type WorkOrderAttachmentPrepareResult,
  type WorkOrderAttachmentUploadInput,
} from "./types";

const attachmentReferenceSchema = z.object({
  attachmentId: z.uuid(),
  workOrderId: z.uuid(),
});

const extensionByMimeType: Record<WorkOrderAttachmentMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function revalidateAttachmentViews(workOrderId: string) {
  revalidatePath(`/ordens-servico/${workOrderId}`);
  revalidatePath("/ordens-servico");
}

export async function prepareWorkOrderAttachmentUploadAction(
  workOrderId: string,
  input: WorkOrderAttachmentUploadInput,
): Promise<WorkOrderAttachmentPrepareResult> {
  const parsedId = z.uuid().safeParse(workOrderId);
  const parsedFile = workOrderAttachmentFileSchema.safeParse(input);

  if (!parsedId.success) {
    return { error: "Ordem de servico invalida." };
  }

  if (!parsedFile.success) {
    return {
      error:
        parsedFile.error.issues[0]?.message ??
        "Nao foi possivel validar esta imagem.",
    };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data: workOrder, error: workOrderError } = await supabase
    .from("work_orders")
    .select("id")
    .eq("id", parsedId.data)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (workOrderError || !workOrder) {
    return { error: "Nao foi possivel localizar esta ordem de servico." };
  }

  const { count, error: countError } = await supabase
    .from("work_order_attachments")
    .select("id", { count: "exact", head: true })
    .eq("work_order_id", parsedId.data)
    .eq("organization_id", identity.organizationId);

  if (countError) {
    return { error: "Nao foi possivel verificar os anexos desta ordem." };
  }

  if ((count ?? 0) >= workOrderAttachmentMaxFiles) {
    return {
      error: `Esta ordem ja atingiu o limite de ${workOrderAttachmentMaxFiles} imagens.`,
    };
  }

  const attachmentId = crypto.randomUUID();
  const file = parsedFile.data;
  const extension = extensionByMimeType[file.mimeType];
  const storagePath = `${identity.organizationId}/${parsedId.data}/${attachmentId}.${extension}`;

  const { error: insertError } = await supabase
    .from("work_order_attachments")
    .insert({
      id: attachmentId,
      organization_id: identity.organizationId,
      work_order_id: parsedId.data,
      uploaded_by: identity.userId,
      storage_path: storagePath,
      file_name: file.fileName,
      mime_type: file.mimeType,
      file_size: file.fileSize,
      upload_status: "pending",
    });

  if (insertError) {
    return { error: "Nao foi possivel preparar o envio desta imagem." };
  }

  const { data: signedUpload, error: signedUploadError } = await supabase.storage
    .from(workOrderAttachmentBucket)
    .createSignedUploadUrl(storagePath);

  if (signedUploadError || !signedUpload) {
    await supabase
      .from("work_order_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("organization_id", identity.organizationId);

    return { error: "Nao foi possivel iniciar o upload no Storage." };
  }

  return {
    error: null,
    upload: {
      attachmentId,
      path: storagePath,
      token: signedUpload.token,
    },
  };
}

export async function completeWorkOrderAttachmentUploadAction(
  workOrderId: string,
  attachmentId: string,
): Promise<WorkOrderAttachmentMutationResult> {
  const parsed = attachmentReferenceSchema.safeParse({
    attachmentId,
    workOrderId,
  });

  if (!parsed.success) {
    return { error: "Nao foi possivel identificar o anexo enviado." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data: attachment, error: lookupError } = await supabase
    .from("work_order_attachments")
    .select("id, storage_path, upload_status")
    .eq("id", parsed.data.attachmentId)
    .eq("work_order_id", parsed.data.workOrderId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (lookupError || !attachment) {
    return { error: "Nao foi possivel localizar o anexo enviado." };
  }

  if (attachment.upload_status === "ready") {
    return { error: null };
  }

  const { data: exists, error: storageError } = await supabase.storage
    .from(workOrderAttachmentBucket)
    .exists(attachment.storage_path);

  if (storageError || !exists) {
    return { error: "O arquivo nao foi encontrado no Storage." };
  }

  const { data, error } = await supabase
    .from("work_order_attachments")
    .update({ upload_status: "ready" })
    .eq("id", parsed.data.attachmentId)
    .eq("work_order_id", parsed.data.workOrderId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel concluir o envio desta imagem." };
  }

  revalidateAttachmentViews(parsed.data.workOrderId);
  return { error: null };
}

export async function cancelWorkOrderAttachmentUploadAction(
  workOrderId: string,
  attachmentId: string,
): Promise<WorkOrderAttachmentMutationResult> {
  const parsed = attachmentReferenceSchema.safeParse({
    attachmentId,
    workOrderId,
  });

  if (!parsed.success) {
    return { error: "Nao foi possivel identificar o upload." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data: attachment, error: lookupError } = await supabase
    .from("work_order_attachments")
    .select("id, storage_path, upload_status")
    .eq("id", parsed.data.attachmentId)
    .eq("work_order_id", parsed.data.workOrderId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (lookupError) {
    return { error: "Nao foi possivel cancelar o upload." };
  }

  if (!attachment) {
    return { error: null };
  }

  if (attachment.upload_status === "ready") {
    return { error: "Este anexo ja foi concluido e nao pode ser cancelado." };
  }

  const { error: storageError } = await supabase.storage
    .from(workOrderAttachmentBucket)
    .remove([attachment.storage_path]);

  if (storageError) {
    return { error: "Nao foi possivel limpar o arquivo incompleto." };
  }

  const { error: deleteError } = await supabase
    .from("work_order_attachments")
    .delete()
    .eq("id", parsed.data.attachmentId)
    .eq("organization_id", identity.organizationId);

  return {
    error: deleteError ? "Nao foi possivel cancelar o upload." : null,
  };
}

export async function deleteWorkOrderAttachmentAction(
  workOrderId: string,
  attachmentId: string,
): Promise<WorkOrderAttachmentMutationResult> {
  const parsed = attachmentReferenceSchema.safeParse({
    attachmentId,
    workOrderId,
  });

  if (!parsed.success) {
    return { error: "Nao foi possivel identificar o anexo." };
  }

  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return { error: "Sua sessao expirou. Entre novamente para continuar." };
  }

  const supabase = await createClient();
  const { data: attachment, error: lookupError } = await supabase
    .from("work_order_attachments")
    .select("id, storage_path")
    .eq("id", parsed.data.attachmentId)
    .eq("work_order_id", parsed.data.workOrderId)
    .eq("organization_id", identity.organizationId)
    .maybeSingle();

  if (lookupError || !attachment) {
    return { error: "Nao foi possivel localizar este anexo." };
  }

  const { error: storageError } = await supabase.storage
    .from(workOrderAttachmentBucket)
    .remove([attachment.storage_path]);

  if (storageError) {
    return { error: "Nao foi possivel remover a imagem do Storage." };
  }

  const { data, error } = await supabase
    .from("work_order_attachments")
    .delete()
    .eq("id", parsed.data.attachmentId)
    .eq("work_order_id", parsed.data.workOrderId)
    .eq("organization_id", identity.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Nao foi possivel excluir o vinculo deste anexo." };
  }

  revalidateAttachmentViews(parsed.data.workOrderId);
  return { error: null };
}
