"use client";

import { useActionState } from "react";
import { SendIcon } from "lucide-react";

import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/actions";

export function CreatePostForm() {
  const [state, formAction, pending] = useActionState(createPost, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea id="caption" name="caption" rows={7} placeholder="Tulis cerita atau kenangan..." required />
        {state.fieldErrors?.caption ? <p className="text-xs text-destructive">{state.fieldErrors.caption[0]}</p> : null}
      </div>
      <FileUpload name="images" label="Upload foto postingan" multiple maxFiles={4} maxSizeMb={5} />
      <Button type="submit" disabled={pending}>
        <SendIcon className="size-4" aria-hidden="true" />
        {pending ? "Menerbitkan..." : "Terbitkan Postingan"}
      </Button>
    </form>
  );
}
