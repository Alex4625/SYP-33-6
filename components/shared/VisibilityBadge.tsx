import { Badge } from "@/components/ui/badge";

export function VisibilityBadge({ hidden }: { hidden: boolean }) {
  return (
    <Badge
      variant="outline"
      className={hidden ? "border-black bg-[#a5b8c0] text-black" : "border-black bg-[#c0d4a7] text-black"}
    >
      {hidden ? "Tersembunyi" : "Publik"}
    </Badge>
  );
}
