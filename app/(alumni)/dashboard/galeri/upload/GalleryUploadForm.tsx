"use client";

import { useActionState } from "react";
import { ImagePlusIcon } from "lucide-react";

import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadGalleryPhoto } from "@/lib/actions";

export function GalleryUploadForm() {
  const [state, formAction, pending] = useActionState(uploadGalleryPhoto, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
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
