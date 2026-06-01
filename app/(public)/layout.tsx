import Link from "next/link";
import { AtSignIcon, UsersRoundIcon } from "lucide-react";

import { Navbar } from "@/components/shared/Navbar";
import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const viewer = session?.user
    ? {
        role: session.user.role,
        status: session.user.status,
        username: session.user.username,
      }
    : null;

  return (
    <>
      <Navbar viewer={viewer} signOutAction={viewer ? signOutAction : undefined} />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card">
        <div className="container grid gap-8 py-10 text-sm md:grid-cols-[minmax(0,1.6fr)_minmax(9rem,0.7fr)_minmax(9rem,0.7fr)]">
          <div className="max-w-md">
            <div className="flex items-center gap-3 text-foreground">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <UsersRoundIcon className="size-5" aria-hidden="true" />
              </span>
              <p className="text-base font-semibold">Alumni SYP-33-6</p>
            </div>
            <p className="mt-4 leading-6 text-muted-foreground">
              Ruang untuk tetap terhubung, berbagi cerita, dan merawat kenangan bersama alumni SYP-33-6.
            </p>
          </div>

          <div>
            <p className="font-semibold text-foreground">Jelajahi</p>
            <nav className="mt-4 grid gap-3 text-muted-foreground" aria-label="Navigasi footer">
              <Link href="/alumni" prefetch={false} className="w-fit transition-colors hover:text-foreground">Direktori</Link>
              <Link href="/postingan" prefetch={false} className="w-fit transition-colors hover:text-foreground">Postingan</Link>
              <Link href="/galeri" prefetch={false} className="w-fit transition-colors hover:text-foreground">Galeri</Link>
            </nav>
          </div>

          <div>
            <p className="font-semibold text-foreground">Instagram</p>
            <nav className="mt-4 grid gap-3 text-muted-foreground" aria-label="Media sosial">
              <a
                href="https://www.instagram.com/semyopal33_?igsh=M3V3enF0aGd5N3Rs"
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 transition-colors hover:text-foreground"
              >
                <AtSignIcon className="size-4" aria-hidden="true" />
                <span>33</span>
              </a>
              <a
                href="https://www.instagram.com/dumpiesssfromus?igsh=MWg1eWZzcm5tZGZhcw=="
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 transition-colors hover:text-foreground"
              >
                <AtSignIcon className="size-4" aria-hidden="true" />
                <span>6</span>
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t">
          <div className="container py-5 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Alumni SYP-33-6. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
