"use client";

import { useState } from "react";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon, PowerIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
type TriggerIconName = "alert" | "eye" | "eye-off" | "power" | "trash";

const triggerIcons = {
  alert: AlertTriangleIcon,
  eye: EyeIcon,
  "eye-off": EyeOffIcon,
  power: PowerIcon,
  trash: Trash2Icon,
} satisfies Record<TriggerIconName, typeof AlertTriangleIcon>;

export function ConfirmDialog({
  title,
  description,
  action,
  actionLabel = "Hapus",
  variant = "danger",
  triggerIcon,
  triggerVariant,
  triggerSize = "sm",
  children,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  actionLabel?: string;
  variant?: "danger" | "warning";
  triggerIcon?: TriggerIconName;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const TriggerIcon = triggerIcons[triggerIcon ?? (variant === "warning" ? "alert" : "trash")];
  const confirmVariant: ButtonVariant = variant === "danger" ? "destructive" : "default";
  const buttonVariant = triggerVariant ?? (variant === "danger" ? "destructive" : "outline");

  return (
    <>
      <Button type="button" variant={buttonVariant} size={triggerSize} onClick={() => setOpen(true)}>
        <TriggerIcon className="size-4" aria-hidden="true" />
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
              <Button type="submit" variant={confirmVariant}>
                {actionLabel}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
