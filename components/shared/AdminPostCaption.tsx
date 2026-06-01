"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AdminPostCaption({ caption }: { caption: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-5">
        {caption}
      </p>
      {caption.length > 120 ? (
        <Button
          type="button"
          variant="link"
          className="mt-1 h-auto p-0 text-xs"
          onClick={() => setOpen(true)}
        >
          Baca lengkap
        </Button>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Caption postingan</DialogTitle>
          </DialogHeader>
          <p className="max-h-[65vh] overflow-y-auto whitespace-pre-wrap break-words pr-2 text-sm leading-6">
            {caption}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
