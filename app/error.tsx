"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <div className="max-w-md border border-black bg-card p-6 text-center dark:border-border">
        <div className="catalog-bevel mx-auto mb-5 flex size-16 items-center justify-center border border-black bg-[#d77a7a] text-black">
          <AlertTriangleIcon className="size-8" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl uppercase leading-none">Terjadi kesalahan</h1>
        <p className="mt-3 text-muted-foreground">Silakan coba lagi. Jika masih terjadi, hubungi admin.</p>
        <Button type="button" className="mt-6" onClick={reset}>
          <RefreshCwIcon className="size-4" aria-hidden="true" />
          Coba Lagi
        </Button>
      </div>
    </main>
  );
}
