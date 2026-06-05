"use client";

import Link from "next/link";
import { CalendarDaysIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, UsersRoundIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/alumni", label: "Direktori" },
  { href: "/postingan", label: "Postingan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kalender", label: "Kalender" },
];

type NavbarViewer = {
  role?: string | null;
  status?: string | null;
  username?: string | null;
} | null;

export function Navbar({
  viewer = null,
  signOutAction,
  todayBirthdayCount = 0,
}: {
  viewer?: NavbarViewer;
  signOutAction?: () => Promise<void>;
  todayBirthdayCount?: number;
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
      <a href={dashboardHref} className={cn(buttonVariants({ variant: "outline" }))}>
        <LayoutDashboardIcon className="size-4" aria-hidden="true" />
        {dashboardLabel}
      </a>
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
      <Link href="/daftar" prefetch={false} className={cn(buttonVariants(), "catalog-bevel border-black bg-accent text-black hover:bg-accent/80")}>Daftar</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white bg-black text-white">
      <div className="container flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" prefetch={false} className="flex items-center gap-2 font-sans text-sm font-bold uppercase">
          <span className="catalog-bevel bg-accent p-2 text-black">
            <UsersRoundIcon className="size-4" aria-hidden="true" />
          </span>
          <span>Alumni SYP-33-6</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className="group px-3 py-2 font-sans text-xs font-bold uppercase text-white hover:bg-white hover:text-black">
              {item.label}
              {item.href === "/kalender" && todayBirthdayCount > 0 ? (
                <span className="ml-1 inline-flex items-center gap-1 text-accent group-hover:text-black">
                  <CalendarDaysIcon className="size-3" aria-hidden="true" />
                  {todayBirthdayCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 text-white md:flex">
          <DarkModeToggle />
          {authActions}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          <button type="button" className="border border-white p-2" onClick={() => setOpen((value) => !value)} aria-label="Buka menu">
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-white bg-black md:hidden">
          <nav className="container grid gap-1 py-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false} className="px-3 py-3 font-sans text-xs font-bold uppercase text-white hover:bg-white hover:text-black" onClick={() => setOpen(false)}>
                {item.label}
                {item.href === "/kalender" && todayBirthdayCount > 0 ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-accent">
                    <CalendarDaysIcon className="size-3" aria-hidden="true" />
                    {todayBirthdayCount}
                  </span>
                ) : null}
              </Link>
            ))}
            <div className={cn("mt-2 grid gap-2", viewer ? "grid-cols-1" : "grid-cols-2")}>
              {viewer ? (
                <>
                  <a
                    href={dashboardHref}
                    className={cn(buttonVariants({ variant: "outline" }))}
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboardIcon className="size-4" aria-hidden="true" />
                    {dashboardLabel}
                  </a>
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
                  <Link href="/daftar" prefetch={false} className={cn(buttonVariants(), "catalog-bevel border-black bg-accent text-black hover:bg-accent/80")} onClick={() => setOpen(false)}>Daftar</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
