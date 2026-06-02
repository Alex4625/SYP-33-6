import Link from "next/link";
import { UsersRoundIcon } from "lucide-react";

import { Navbar } from "@/components/shared/Navbar";
import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" fill="currentColor" r="1" stroke="none" />
    </svg>
  );
}

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
      <footer className="border-t border-black bg-background dark:border-border">
        <div className="container grid gap-8 py-10 text-sm md:grid-cols-[minmax(0,1.6fr)_minmax(9rem,0.7fr)_minmax(9rem,0.7fr)]">
          <div className="max-w-md">
            <div className="flex items-center gap-3 text-foreground">
              <span className="catalog-bevel flex size-10 items-center justify-center bg-accent text-black">
                <UsersRoundIcon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-sans text-sm font-bold uppercase">Alumni SYP-33-6</p>
            </div>
            <p className="mt-4 leading-6 text-muted-foreground">
              Ruang untuk tetap terhubung, berbagi cerita, dan merawat kenangan bersama alumni SYP-33-6.
            </p>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase text-foreground">Jelajahi</p>
            <nav className="mt-4 grid gap-3 text-muted-foreground" aria-label="Navigasi footer">
              <Link href="/alumni" prefetch={false} className="w-fit font-sans text-xs font-bold uppercase text-accent transition-colors hover:text-foreground">Direktori</Link>
              <Link href="/postingan" prefetch={false} className="w-fit font-sans text-xs font-bold uppercase text-accent transition-colors hover:text-foreground">Postingan</Link>
              <Link href="/galeri" prefetch={false} className="w-fit font-sans text-xs font-bold uppercase text-accent transition-colors hover:text-foreground">Galeri</Link>
            </nav>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase text-foreground">Instagram</p>
            <nav className="mt-4 grid gap-3 text-muted-foreground" aria-label="Media sosial">
              <a
                href="https://www.instagram.com/semyopal33_?igsh=M3V3enF0aGd5N3Rs"
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 font-sans text-xs font-bold uppercase text-accent transition-colors hover:text-foreground"
              >
                <InstagramLogo className="size-4" />
                <span>33</span>
              </a>
              <a
                href="https://www.instagram.com/dumpiesssfromus?igsh=MWg1eWZzcm5tZGZhcw=="
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 font-sans text-xs font-bold uppercase text-accent transition-colors hover:text-foreground"
              >
                <InstagramLogo className="size-4" />
                <span>6</span>
              </a>
              <a
                href="https://www.instagram.com/osissmaksemyopal2?igsh=MTlhd28ycjNoNDQyNw=="
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 font-sans text-xs font-bold uppercase text-accent transition-colors hover:text-foreground"
              >
                <InstagramLogo className="size-4" />
                <span>Almamater</span>
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t border-black dark:border-border">
          <div className="container py-5 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Alumni SYP-33-6. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
