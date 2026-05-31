"use client";

import Image from "next/image";
import { ImagePlusIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { compressImageFile } from "@/lib/client-image";
import { cn } from "@/lib/utils";

type PreviewFile = {
  file: File;
  name: string;
  url: string;
};

export function FileUpload({
  name,
  multiple = false,
  maxFiles = 1,
  label = "Pilih foto",
  maxSizeMb = 5,
}: {
  name: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  maxSizeMb?: number;
}) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const previewsRef = useRef<PreviewFile[]>([]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError("");
    setProcessing(true);

    try {
      const files = await Promise.all(acceptedFiles.map(compressImageFile));
      setPreviews((current) => {
        const additions = files.map((file) => ({
          file,
          name: file.name,
          url: URL.createObjectURL(file),
        }));
        const next = (multiple ? [...current, ...additions] : additions).slice(0, maxFiles);
        const removed = [...current, ...additions].filter((preview) => !next.includes(preview));
        removed.forEach((preview) => URL.revokeObjectURL(preview.url));
        return next;
      });
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Foto tidak dapat diproses.");
    } finally {
      setProcessing(false);
    }
  }, [maxFiles, multiple]);

  const { getRootProps, getInputProps, inputRef, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize: maxSizeMb * 1024 * 1024,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  useEffect(() => {
    previewsRef.current = previews;
    if (!inputRef.current) return;

    const transfer = new DataTransfer();
    previews.forEach((preview) => transfer.items.add(preview.file));
    inputRef.current.files = transfer.files;
  }, [inputRef, previews]);

  useEffect(() => () => previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url)), []);

  const hasPreviews = previews.length > 0;
  const canAddMore = previews.length < maxFiles;

  return (
    <div className="space-y-3">
      <input {...getInputProps({ name })} />
      {canAddMore ? (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-lg border border-dashed bg-muted/30 text-center transition hover:bg-muted/50",
            hasPreviews ? "min-h-16 gap-3 p-3" : "min-h-40 flex-col p-5",
            isDragActive && "border-primary bg-accent/20",
            processing && "pointer-events-none opacity-70",
          )}
        >
          {hasPreviews ? (
            <ImagePlusIcon className="size-5 text-primary" aria-hidden="true" />
          ) : (
            <UploadCloudIcon className="mb-3 size-8 text-primary" aria-hidden="true" />
          )}
          <div className={hasPreviews ? "text-left" : undefined}>
            <p className="text-sm font-medium">{processing ? "Menyiapkan foto..." : hasPreviews ? "Tambah foto lain" : label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP. Maksimal {maxSizeMb} MB{multiple ? `, hingga ${maxFiles} foto` : ""}. Foto besar otomatis dikompres.
            </p>
          </div>
        </div>
      ) : null}
      {fileRejections.length > 0 ? (
        <p className="text-sm text-destructive">Format atau ukuran file tidak sesuai.</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {hasPreviews ? (
        <>
          <p className="text-xs text-muted-foreground">
            {previews.length} dari {maxFiles} foto dipilih.
          </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((preview) => (
            <div key={preview.url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image src={preview.url} alt={preview.name} fill className="object-cover" sizes="120px" />
              <Button
                type="button"
                size="icon-xs"
                variant="destructive"
                className="absolute right-2 top-2 bg-background/90 opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviews((current) => current.filter((item) => item.url !== preview.url));
                  URL.revokeObjectURL(preview.url);
                }}
                aria-label={`Hapus ${preview.name}`}
              >
                <XIcon className="size-3" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
        </>
      ) : null}
    </div>
  );
}
