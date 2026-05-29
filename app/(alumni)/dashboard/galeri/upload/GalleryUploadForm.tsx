"use client";

import { useState } from "react";
import { ImagePlusIcon } from "lucide-react";

import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function GalleryUploadForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 90_000);

    try {
      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: new FormData(event.currentTarget),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.error ?? "Foto belum berhasil diunggah. Silakan coba lagi.");
        setPending(false);
        return;
      }

      window.location.assign(result.redirectTo ?? "/dashboard");
    } catch (error) {
      setError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Upload terlalu lama. Coba kompres foto atau unggah ulang."
          : "Foto belum berhasil diunggah. Silakan coba lagi.",
      );
      setPending(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <FileUpload name="image" label="Upload foto galeri" maxFiles={1} maxSizeMb={5} />
      <div className="space-y-2">
        <Label htmlFor="caption">Keterangan</Label>
        <Textarea id="caption" name="caption" rows={4} placeholder="Keterangan foto opsional" />
      </div>
      <Button type="submit" disabled={pending}>
        <ImagePlusIcon className="size-4" aria-hidden="true" />
        {pending ? "Mengunggah..." : "Upload Foto"}
      </Button>
    </form>
  );
}
