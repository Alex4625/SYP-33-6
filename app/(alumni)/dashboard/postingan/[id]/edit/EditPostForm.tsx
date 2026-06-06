"use client";

import Image from "next/image";
import Link from "next/link";
import { RotateCcwIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { FileUpload } from "@/components/shared/FileUpload";
import { FormNotice } from "@/components/shared/FormNotice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mediaVariantUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type ExistingImage = {
  id: string;
  imageUrl: string;
  orderIndex: number;
};

export function EditPostForm({
  postId,
  caption,
  images,
}: {
  postId: string;
  caption: string;
  images: ExistingImage[];
}) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const remainingImageCount = images.length - removedIds.length;
  const availableSlots = 4 - remainingImageCount;

  function toggleRemoved(imageId: string) {
    setRemovedIds((current) =>
      current.includes(imageId) ? current.filter((id) => id !== imageId) : [...current, imageId],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
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
        setError(firstFieldError ?? result.error ?? "Postingan belum berhasil diperbarui. Silakan coba lagi.");
        return;
      }

      window.location.assign(result.redirectTo ?? "/dashboard/postingan");
    } catch (submitError) {
      setError(
        submitError instanceof DOMException && submitError.name === "AbortError"
          ? "Penyimpanan terlalu lama. Coba kompres foto atau simpan ulang."
          : "Postingan belum berhasil diperbarui. Silakan coba lagi.",
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
        <Textarea id="caption" name="caption" rows={7} defaultValue={caption} required />
      </div>

      {images.length ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Foto saat ini</p>
            <p className="text-xs text-muted-foreground">Tandai foto yang ingin dilepas dari postingan.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image) => {
              const removed = removedIds.includes(image.id);
              const thumbnailUrl = mediaVariantUrl(image.imageUrl, 280, 76) ?? image.imageUrl;
              return (
                <div key={image.id} className={cn("relative aspect-square overflow-hidden border border-black bg-muted dark:border-border", removed && "opacity-45")}>
                  <Image src={thumbnailUrl} alt="Foto postingan" fill className="object-cover" sizes="140px" />
                  <Button
                    type="button"
                    size="icon-xs"
                    variant={removed ? "outline" : "destructive"}
                    className="absolute right-2 top-2 bg-background/90"
                    onClick={() => toggleRemoved(image.id)}
                    aria-label={removed ? "Batalkan hapus foto" : "Hapus foto"}
                  >
                    {removed ? <RotateCcwIcon className="size-3" /> : <Trash2Icon className="size-3" />}
                  </Button>
                  {removed ? (
                    <>
                      <input type="hidden" name="removeImageIds" value={image.id} />
                      <span className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-1 text-center text-xs text-white">Akan dihapus</span>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {availableSlots > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Tambah foto</p>
          <FileUpload name="images" label="Pilih foto tambahan" multiple maxFiles={availableSlots} maxSizeMb={5} />
        </div>
      ) : (
        <FormNotice>
          Batas empat foto sudah terisi. Lepas salah satu foto jika ingin menambahkan foto baru.
        </FormNotice>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          <SaveIcon className="size-4" aria-hidden="true" />
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Link href="/dashboard/postingan" className={cn(buttonVariants({ variant: "outline" }))}>
          Batal
        </Link>
      </div>
    </form>
  );
}
