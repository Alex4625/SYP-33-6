"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  title,
  description,
  action,
  actionLabel = "Hapus",
  children,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2Icon className="size-4" aria-hidden="true" />
        {children ?? actionLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border bg-popover p-5 shadow-xl">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <form action={action} className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="destructive">
                {actionLabel}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
