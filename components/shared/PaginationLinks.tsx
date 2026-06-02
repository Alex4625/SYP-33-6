import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageHref(basePath: string, searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "halaman") return;
    if (Array.isArray(value)) {
      value.forEach((item) => item && params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  });
  params.set("halaman", String(page));
  return `${basePath}?${params.toString()}`;
}

export function PaginationLinks({
  basePath,
  currentPage,
  totalPages,
  searchParams,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Paginasi">
      <Link
        href={pageHref(basePath, searchParams, Math.max(1, currentPage - 1))}
        prefetch={false}
        className={cn(buttonVariants({ variant: "outline" }), currentPage === 1 && "pointer-events-none opacity-50")}
      >
        Sebelumnya
      </Link>
      <span className="border border-black bg-card px-3 py-1.5 font-sans text-xs font-bold uppercase dark:border-border">
        Halaman {currentPage} dari {totalPages}
      </span>
      <Link
        href={pageHref(basePath, searchParams, Math.min(totalPages, currentPage + 1))}
        prefetch={false}
        className={cn(buttonVariants({ variant: "outline" }), currentPage === totalPages && "pointer-events-none opacity-50")}
      >
        Berikutnya
      </Link>
    </nav>
  );
}
