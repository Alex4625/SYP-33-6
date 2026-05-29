"use client";

import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon, MenuIcon, UsersRoundIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/alumni", label: "Direktori" },
  { href: "/postingan", label: "Postingan" },
  { href: "/galeri", label: "Galeri" },
];

type NavbarViewer = {
  role?: string | null;
  status?: string | null;
  username?: string | null;
} | null;

export function Navbar({
  viewer = null,
  signOutAction,
}: {
  viewer?: NavbarViewer;
  signOutAction?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const dashboardHref =
    viewer?.role === "ADMIN"
      ? "/admin"
      : viewer?.status === "APPROVED"
        ? "/dashboard"
        : "/status-akun";
  const dashboardLabel = viewer?.role === "ADMIN" ? "Panel Admin" : "Dashboard";

  const authActions = viewer ? (
    <>
      <Link href={dashboardHref} prefetch={false} className={cn(buttonVariants({ variant: "outline" }))}>
        <LayoutDashboardIcon className="size-4" aria-hidden="true" />
        {dashboardLabel}
      </Link>
      {signOutAction ? (
        <form action={signOutAction}>
          <Button type="submit" variant="ghost">
            <LogOutIcon className="size-4" aria-hidden="true" />
            Keluar
          </Button>
        </form>
      ) : null}
    </>
  ) : (
    <>
      <Link href="/login" prefetch={false} className={cn(buttonVariants({ variant: "outline" }))}>Masuk</Link>
      <Link href="/daftar" prefetch={false} className={cn(buttonVariants())}>Daftar</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" prefetch={false} className="flex items-center gap-2 font-semibold">
          <span className="rounded-md bg-primary p-2 text-primary-foreground">
            <UsersRoundIcon className="size-4" aria-hidden="true" />
          </span>
          <span>Alumni SYP-33-6</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <DarkModeToggle />
          {authActions}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          <button type="button" className="rounded-md border p-2" onClick={() => setOpen((value) => !value)} aria-label="Buka menu">
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t bg-background md:hidden">
          <nav className="container grid gap-1 py-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false} className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className={cn("mt-2 grid gap-2", viewer ? "grid-cols-1" : "grid-cols-2")}>
              {viewer ? (
                <>
                  <Link
                    href={dashboardHref}
                    prefetch={false}
                    className={cn(buttonVariants({ variant: "outline" }))}
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboardIcon className="size-4" aria-hidden="true" />
                    {dashboardLabel}
                  </Link>
                  {signOutAction ? (
                    <form action={signOutAction}>
                      <Button type="submit" variant="ghost" className="w-full">
                        <LogOutIcon className="size-4" aria-hidden="true" />
                        Keluar
                      </Button>
                    </form>
                  ) : null}
                </>
              ) : (
                <>
                  <Link href="/login" prefetch={false} className={cn(buttonVariants({ variant: "outline" }))} onClick={() => setOpen(false)}>Masuk</Link>
                  <Link href="/daftar" prefetch={false} className={cn(buttonVariants())} onClick={() => setOpen(false)}>Daftar</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
