import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-lg bg-muted text-primary">
          <SearchXIcon className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-muted-foreground">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
        <Link href="/" className={cn(buttonVariants(), "mt-6")}>Kembali ke Beranda</Link>
      </div>
    </main>
  );
}
