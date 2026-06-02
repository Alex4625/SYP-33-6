import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const variantClasses = {
  error: "bg-[#d77a7a]",
  info: "bg-[#9ab6c8]",
  success: "bg-[#c0d4a7]",
  warning: "bg-[#fcc20f]",
} as const;

export function FormNotice({
  children,
  className,
  variant = "info",
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variantClasses;
}) {
  return (
    <p className={cn("border border-black p-3 text-sm leading-5 text-black dark:border-border", variantClasses[variant], className)}>
      {children}
    </p>
  );
}
