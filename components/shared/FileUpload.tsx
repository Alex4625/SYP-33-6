"use client";

import Image from "next/image";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PreviewFile = {
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
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPreviews((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
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

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-5 text-center transition hover:bg-muted/50",
          isDragActive && "border-primary bg-accent/20",
        )}
      >
        <input {...getInputProps({ name })} />
        <UploadCloudIcon className="mb-3 size-8 text-primary" aria-hidden="true" />
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP. Maksimal {maxSizeMb} MB{multiple ? `, hingga ${maxFiles} foto` : ""}.
        </p>
      </div>
      {fileRejections.length > 0 ? (
        <p className="text-sm text-destructive">Format atau ukuran file tidak sesuai.</p>
      ) : null}
      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((preview) => (
            <div key={preview.url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image src={preview.url} alt={preview.name} fill className="object-cover" sizes="120px" />
              <Button
                type="button"
                size="icon-xs"
                variant="destructive"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
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
      ) : null}
    </div>
  );
}
