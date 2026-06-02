import { Badge } from "@/components/ui/badge";
import type { AccountStatus } from "@/db/schema";
import { cn } from "@/lib/utils";

const statusLabel: Record<AccountStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Aktif",
  REJECTED: "Ditolak",
  DISABLED: "Nonaktif",
};

const statusClass: Record<AccountStatus, string> = {
  PENDING: "border-black bg-[#fcc20f] text-black",
  APPROVED: "border-black bg-[#c0d4a7] text-black",
  REJECTED: "border-black bg-[#d77a7a] text-black",
  DISABLED: "border-black bg-[#a5b8c0] text-black",
};

export function StatusBadge({ status, className }: { status: AccountStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(statusClass[status], className)}>
      {statusLabel[status]}
    </Badge>
  );
}
