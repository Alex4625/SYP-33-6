import type { Metadata } from "next";
import { Clock3Icon, LogOutIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Status Akun",
};

export default async function AccountStatusPage() {
  const session = await auth();
  const user = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { alumniProfile: true },
      })
    : null;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  const rejected = user?.status === "REJECTED";

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-xl rounded-lg shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-lg bg-accent/25 text-primary">
            {rejected ? <XCircleIcon className="size-8" aria-hidden="true" /> : <Clock3Icon className="size-8" aria-hidden="true" />}
          </div>
          <h1 className="text-2xl font-semibold">{rejected ? "Registrasi Ditolak" : "Menunggu Verifikasi Admin"}</h1>
          <p className="mt-3 text-muted-foreground">
            {rejected
              ? "Registrasi Anda belum dapat disetujui oleh admin."
              : "Registrasi Anda sedang ditinjau admin. Setelah disetujui, dashboard alumni akan terbuka otomatis saat login berikutnya."}
          </p>
          {rejected && user?.rejectionReason ? (
            <div className="mt-5 rounded-lg border bg-muted/40 p-4 text-left text-sm">
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
