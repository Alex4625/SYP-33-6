import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tintClasses = {
  sage: "bg-[#b3bd95]",
  salmon: "bg-[#d77a7a]",
  peach: "bg-[#e6915d]",
  lime: "bg-[#c0d4a7]",
  sky: "bg-[#9ab6c8]",
  steel: "bg-[#a5b8c0]",
  periwinkle: "bg-[#8c9ae0]",
  olive: "bg-[#8e8a25]",
} as const;

export type CatalogTint = keyof typeof tintClasses;

export function CatalogPageHeader({
  title,
  description,
  eyebrow,
  action,
  tint = "sage",
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  tint?: CatalogTint;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 border border-black p-4 text-black dark:border-border", tintClasses[tint], className)}>
      {eyebrow ? <p className="font-sans text-xs font-bold uppercase">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
        <h1 className="break-words font-display text-3xl uppercase leading-none">
          {title}
        </h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-5 text-black/80">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
