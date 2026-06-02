import { InboxIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-56 flex-col items-center justify-center border border-dashed border-black bg-card p-8 text-center dark:border-border", className)}>
      <InboxIcon className="mb-3 size-9 text-muted-foreground" aria-hidden="true" />
      <h3 className="font-sans text-sm font-bold uppercase">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
