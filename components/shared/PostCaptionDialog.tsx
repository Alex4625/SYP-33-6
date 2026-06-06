"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PostCaptionDialog({
  open,
  onOpenChange,
  authorName,
  dateLabel,
  caption,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorName: string;
  dateLabel: string;
  caption: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Caption postingan</DialogTitle>
          <DialogDescription>
            {authorName} - {dateLabel}
          </DialogDescription>
        </DialogHeader>
        <p className="max-h-[65vh] overflow-y-auto whitespace-pre-wrap pr-2 text-sm leading-6 text-foreground">
          {caption}
        </p>
      </DialogContent>
    </Dialog>
  );
}
