import { Skeleton } from "@/components/ui/skeleton";

export default function AlumniLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-10 w-72" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
