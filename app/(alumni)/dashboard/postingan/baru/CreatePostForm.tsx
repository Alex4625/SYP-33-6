"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";

import { FileUpload } from "@/components/shared/FileUpload";
import { FormNotice } from "@/components/shared/FormNotice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreatePostForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: new FormData(event.currentTarget),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        fieldErrors?: Record<string, string[] | undefined>;
        redirectTo?: string;
      };

      if (!response.ok || !result.success) {
        const firstFieldError = Object.values(result.fieldErrors ?? {}).flat().find(Boolean);
        setError(firstFieldError ?? result.error ?? "Postingan belum berhasil diterbitkan. Silakan coba lagi.");
        return;
      }

      window.location.assign(result.redirectTo ?? "/dashboard/postingan");
    } catch (error) {
      setError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Upload terlalu lama. Coba kompres foto atau terbitkan ulang dengan jumlah foto lebih sedikit."
          : "Postingan belum berhasil diterbitkan. Silakan coba lagi.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? <FormNotice variant="error">{error}</FormNotice> : null}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea id="caption" name="caption" rows={7} placeholder="Tulis cerita atau kenangan..." required />
      </div>
      <FileUpload name="images" label="Upload foto postingan" multiple maxFiles={4} maxSizeMb={5} />
      <Button type="submit" disabled={pending}>
        <SendIcon className="size-4" aria-hidden="true" />
        {pending ? "Menerbitkan..." : "Terbitkan Postingan"}
      </Button>
    </form>
  );
}
