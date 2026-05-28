import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AccountStatus } from "@prisma/client";

const statusLabel: Record<AccountStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Aktif",
  REJECTED: "Ditolak",
  DISABLED: "Nonaktif",
};

const statusClass: Record<AccountStatus, string> = {
  PENDING: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  APPROVED: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  REJECTED: "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
  DISABLED: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

export function StatusBadge({ status, className }: { status: AccountStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(statusClass[status], className)}>
      {statusLabel[status]}
    </Badge>
  );
}
