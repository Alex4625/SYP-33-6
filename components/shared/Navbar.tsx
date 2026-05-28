"use client";

import Link from "next/link";
import { MenuIcon, UsersRoundIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/alumni", label: "Direktori" },
  { href: "/postingan", label: "Postingan" },
  { href: "/galeri", label: "Galeri" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="rounded-md bg-primary p-2 text-primary-foreground">
            <UsersRoundIcon className="size-4" aria-hidden="true" />
          </span>
          <span>Alumni SYP-33-6</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <DarkModeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>Masuk</Link>
          <Link href="/daftar" className={cn(buttonVariants())}>Daftar</Link>
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
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>Masuk</Link>
              <Link href="/daftar" className={cn(buttonVariants())}>Daftar</Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
