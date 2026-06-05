import { GiftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function BirthdayBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "catalog-bevel inline-flex items-center gap-1 border border-black bg-accent px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase leading-none text-black",
        className,
      )}
    >
      <GiftIcon className="size-3" aria-hidden="true" />
      {count}
    </span>
  );
}
