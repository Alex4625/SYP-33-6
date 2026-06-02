import type { Metadata } from "next";
import { Clock3Icon, LogOutIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, signOut } from "@/lib/auth";
import { getUserWithProfileById } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status Akun",
};

export default async function AccountStatusPage() {
  const session = await auth();
  const user = session?.user ? await getUserWithProfileById(session.user.id) : null;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const rejected = user?.status === "REJECTED";

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardContent className="p-8 text-center">
          <div className="catalog-bevel mx-auto mb-5 flex size-16 items-center justify-center border border-black bg-[#fcc20f] text-black">
            {rejected ? <XCircleIcon className="size-8" aria-hidden="true" /> : <Clock3Icon className="size-8" aria-hidden="true" />}
          </div>
          <h1 className="font-display text-2xl uppercase leading-none">{rejected ? "Registrasi Ditolak" : "Menunggu Verifikasi Admin"}</h1>
          <p className="mt-3 text-muted-foreground">
            {rejected
              ? "Registrasi Anda belum dapat disetujui oleh admin."
              : "Registrasi Anda sedang ditinjau admin. Setelah disetujui, dashboard alumni akan terbuka otomatis saat login berikutnya."}
          </p>
          {rejected && user?.rejectionReason ? (
            <div className="mt-5 border border-black bg-[#d77a7a] p-4 text-left text-sm text-black">
              <p className="font-medium">Alasan penolakan</p>
              <p className="mt-1 text-muted-foreground">{user.rejectionReason}</p>
            </div>
          ) : null}
          <form action={signOutAction} className="mt-6">
            <Button type="submit" variant="outline">
              <LogOutIcon className="size-4" aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
