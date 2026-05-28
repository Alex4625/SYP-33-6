import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md">
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
