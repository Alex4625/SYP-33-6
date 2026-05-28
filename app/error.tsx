"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold">Terjadi kesalahan</h1>
        <p className="mt-3 text-muted-foreground">Silakan coba lagi. Jika masih terjadi, hubungi admin.</p>
        <Button type="button" className="mt-6" onClick={reset}>
          <RefreshCwIcon className="size-4" aria-hidden="true" />
          Coba Lagi
        </Button>
      </div>
    </main>
  );
}
