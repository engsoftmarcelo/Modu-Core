"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  FileImage,
  ImageOff,
  Images,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import {
  cancelWorkOrderAttachmentUploadAction,
  completeWorkOrderAttachmentUploadAction,
  deleteWorkOrderAttachmentAction,
  prepareWorkOrderAttachmentUploadAction,
} from "../attachment-actions";
import { workOrderAttachmentFileSchema } from "../schema";
import {
  workOrderAttachmentBucket,
  workOrderAttachmentMaxBatch,
  workOrderAttachmentMaxFiles,
  type WorkOrderAttachmentGalleryItem,
} from "../types";

type WorkOrderAttachmentsProps = {
  attachments: WorkOrderAttachmentGalleryItem[];
  workOrderId: string;
};

type Feedback = {
  message: string;
  tone: "error" | "success";
} | null;

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function WorkOrderAttachments({
  attachments,
  workOrderId,
}: WorkOrderAttachmentsProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [feedback, setFeedback] = useState<Feedback>(null);

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    setFeedback(null);

    if (files.length > workOrderAttachmentMaxBatch) {
      setSelectedFiles([]);
      event.currentTarget.value = "";
      setFeedback({
        tone: "error",
        message: `Selecione no maximo ${workOrderAttachmentMaxBatch} imagens por envio.`,
      });
      return;
    }

    if (attachments.length + files.length > workOrderAttachmentMaxFiles) {
      setSelectedFiles([]);
      event.currentTarget.value = "";
      setFeedback({
        tone: "error",
        message: `Cada ordem pode ter ate ${workOrderAttachmentMaxFiles} imagens.`,
      });
      return;
    }

    for (const file of files) {
      const parsed = workOrderAttachmentFileSchema.safeParse({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      if (!parsed.success) {
        setSelectedFiles([]);
        event.currentTarget.value = "";
        setFeedback({
          tone: "error",
          message:
            parsed.error.issues[0]?.message ??
            "Nao foi possivel validar uma das imagens.",
        });
        return;
      }
    }

    setSelectedFiles(files);
  }

  async function uploadFiles() {
    if (!selectedFiles.length || uploading) {
      return;
    }

    setUploading(true);
    setFeedback(null);

    const supabase = createClient();
    const failedFiles: File[] = [];
    const errors: string[] = [];
    let uploadedCount = 0;

    for (const [index, file] of selectedFiles.entries()) {
      setUploadProgress({ current: index + 1, total: selectedFiles.length });

      const prepared = await prepareWorkOrderAttachmentUploadAction(
        workOrderId,
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      );

      if (prepared.error || !prepared.upload) {
        failedFiles.push(file);
        errors.push(`${file.name}: ${prepared.error ?? "falha ao preparar"}`);
        continue;
      }

      const { attachmentId, path, token } = prepared.upload;
      const { error: uploadError } = await supabase.storage
        .from(workOrderAttachmentBucket)
        .uploadToSignedUrl(path, token, file, {
          cacheControl: "3600",
          contentType: file.type,
        });

      if (uploadError) {
        await cancelWorkOrderAttachmentUploadAction(workOrderId, attachmentId);
        failedFiles.push(file);
        errors.push(`${file.name}: falha no envio para o Storage`);
        continue;
      }

      const completed = await completeWorkOrderAttachmentUploadAction(
        workOrderId,
        attachmentId,
      );

      if (completed.error) {
        await cancelWorkOrderAttachmentUploadAction(workOrderId, attachmentId);
        failedFiles.push(file);
        errors.push(`${file.name}: ${completed.error}`);
        continue;
      }

      uploadedCount += 1;
    }

    setUploading(false);
    setUploadProgress(null);
    setSelectedFiles(failedFiles);

    if (!failedFiles.length && inputRef.current) {
      inputRef.current.value = "";
    }

    if (!failedFiles.length && cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (uploadedCount) {
      router.refresh();
    }

    if (errors.length) {
      setFeedback({
        tone: "error",
        message:
          uploadedCount > 0
            ? `${uploadedCount} imagem(ns) enviada(s). ${errors[0]}`
            : errors[0],
      });
    } else {
      setFeedback({
        tone: "success",
        message:
          uploadedCount === 1
            ? "Imagem enviada com sucesso."
            : `${uploadedCount} imagens enviadas com sucesso.`,
      });
    }
  }

  async function deleteAttachment(attachment: WorkOrderAttachmentGalleryItem) {
    if (
      !window.confirm(`Remover a imagem "${attachment.fileName}" desta ordem?`)
    ) {
      return;
    }

    setDeletingId(attachment.id);
    setFeedback(null);

    const result = await deleteWorkOrderAttachmentAction(
      workOrderId,
      attachment.id,
    );

    setDeletingId(null);

    if (result.error) {
      setFeedback({ tone: "error", message: result.error });
      return;
    }

    setFeedback({
      tone: "success",
      message: "Imagem removida com sucesso.",
    });
    router.refresh();
  }

  function markImageAsBroken(attachmentId: string) {
    setBrokenImageIds((current) => new Set(current).add(attachmentId));
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
            <Images className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-bold text-ink-950">Fotos e anexos</h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {attachments.length} de {workOrderAttachmentMaxFiles} imagens
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
          JPG, PNG ou WebP
        </span>
      </div>

      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={handleFileSelection}
          className="sr-only"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          disabled={uploading}
          onChange={handleFileSelection}
          className="sr-only"
        />

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <Button
            variant="secondary"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading || attachments.length >= workOrderAttachmentMaxFiles}
            className="w-full sm:hidden"
          >
            <Camera className="size-5" />
            Tirar foto
          </Button>
          <Button
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || attachments.length >= workOrderAttachmentMaxFiles}
            className="w-full sm:w-auto"
          >
            <Images className="size-5" />
            Galeria
          </Button>
          <Button
            onClick={() => void uploadFiles()}
            disabled={!selectedFiles.length || uploading}
            className="col-span-2 w-full sm:col-auto sm:w-auto"
          >
            {uploading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
            {uploading && uploadProgress
              ? `Enviando ${uploadProgress.current} de ${uploadProgress.total}`
              : selectedFiles.length
                ? `Enviar ${selectedFiles.length} foto(s)`
                : "Enviar fotos"}
          </Button>
          <p className="col-span-2 text-xs font-semibold text-slate-400 sm:ml-auto">
            Ate 5 MB por imagem
          </p>
        </div>

        {selectedFiles.length ? (
          <ul className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
            {selectedFiles.map((file) => (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="flex min-h-12 items-center gap-3 py-2"
              >
                <FileImage className="size-4 shrink-0 text-cyan-600" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-600">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-400">
                  {formatFileSize(file.size)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {feedback ? (
          <div
            role={feedback.tone === "error" ? "alert" : "status"}
            className={cn(
              "mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
              feedback.tone === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-800",
            )}
          >
            {feedback.tone === "error" ? (
              <CircleAlert className="size-5 shrink-0" />
            ) : (
              <CheckCircle2 className="size-5 shrink-0" />
            )}
            {feedback.message}
          </div>
        ) : null}
      </div>

      {attachments.length ? (
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4">
            {attachments.map((attachment) => {
              const deleting = deletingId === attachment.id;
              const imageBroken = brokenImageIds.has(attachment.id);

              return (
                <figure key={attachment.id} className="min-w-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    {imageBroken ? (
                      <div className="grid size-full place-items-center text-slate-400">
                        <ImageOff className="size-7" />
                      </div>
                    ) : (
                      <a
                        href={attachment.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Abrir ${attachment.fileName}`}
                      >
                        <Image
                          src={attachment.signedUrl}
                          alt={attachment.fileName}
                          fill
                          unoptimized
                          sizes="(max-width: 639px) 44vw, 220px"
                          onError={() => markImageAsBroken(attachment.id)}
                          className="object-cover transition duration-200 hover:scale-[1.02]"
                        />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => void deleteAttachment(attachment)}
                      disabled={deleting || uploading}
                      aria-label={`Remover ${attachment.fileName}`}
                      title="Remover imagem"
                      className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/95 text-red-600 shadow-md transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      {deleting ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                  <figcaption className="mt-2 min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-950">
                      {attachment.fileName}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid min-h-32 place-items-center px-5 py-7 text-center sm:px-6">
          <div className="max-w-sm">
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <FileImage className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-bold text-ink-950">
              Nenhuma foto anexada ainda.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Adicione imagens do local, do problema ou do servico concluido.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
