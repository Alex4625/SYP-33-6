import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <div className="max-w-md border border-black bg-card p-6 text-center dark:border-border">
        <div className="catalog-bevel mx-auto mb-5 flex size-16 items-center justify-center border border-black bg-[#9ab6c8] text-black">
          <SearchXIcon className="size-8" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl uppercase leading-none">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-muted-foreground">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
        <Link href="/" className={cn(buttonVariants(), "mt-6")}>Kembali ke Beranda</Link>
      </div>
    </main>
  );
}
