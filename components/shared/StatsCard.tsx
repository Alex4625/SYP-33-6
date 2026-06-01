import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("border-black bg-card dark:border-border", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-2xl tracking-normal">{value}</p>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {Icon ? (
          <span className="catalog-bevel bg-accent p-2 text-black">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
