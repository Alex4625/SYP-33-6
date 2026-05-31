"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  CameraIcon,
  ClipboardCheckIcon,
  FilePlus2Icon,
  FileTextIcon,
  Globe2Icon,
  HomeIcon,
  ImageIcon,
  LogOutIcon,
  MenuIcon,
  PencilIcon,
  UsersIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  badge?: number;
};

function workspaceItems(role: "ADMIN" | "ALUMNI", pendingCount: number): NavItem[] {
  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Dashboard", icon: HomeIcon },
      { href: "/admin/verifikasi", label: "Verifikasi", icon: ClipboardCheckIcon, badge: pendingCount },
      { href: "/admin/alumni", label: "Alumni", icon: UsersIcon },
      { href: "/admin/postingan", label: "Postingan", icon: FileTextIcon },
      { href: "/admin/galeri", label: "Galeri", icon: CameraIcon },
      { href: "/admin/log", label: "Audit Log", icon: BarChart3Icon },
    ];
  }

  return [
    { href: "/dashboard", label: "Beranda", icon: HomeIcon },
    { href: "/dashboard/profil", label: "Edit Profil", icon: PencilIcon },
    { href: "/dashboard/postingan/baru", label: "Buat Postingan", icon: FilePlus2Icon },
    { href: "/dashboard/postingan", label: "Postingan Saya", icon: FileTextIcon },
    { href: "/dashboard/galeri", label: "Galeri Saya", icon: ImageIcon },
  ];
}

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  mobile = false,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const className = cn(
    "flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
    isActive(pathname, item.href) && "bg-muted font-medium text-foreground",
    mobile && "w-full px-3",
  );
  const content = (
    <>
      <Icon className="size-4" aria-hidden="true" />
      <span>{item.label}</span>
      {item.badge ? (
        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onNavigate}
      className={className}
    >
      {content}
    </Link>
  );
}

export function DashboardNavbar({
  role,
  pendingCount = 0,
  signOutAction,
}: {
  role: "ADMIN" | "ALUMNI";
  pendingCount?: number;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = workspaceItems(role, pendingCount);
  const homeHref = role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex min-h-16 items-center gap-3">
        <Link href={homeHref} prefetch={false} className="mr-auto flex shrink-0 items-center gap-2 font-semibold">
          <span className="rounded-md bg-primary p-2 text-primary-foreground">
            <UsersRoundIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{role === "ADMIN" ? "Panel Admin" : "Alumni SYP-33-6"}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {items.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
        </nav>

        <div className="hidden items-center gap-1 xl:flex">
          <Link href="/" prefetch={false} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            <Globe2Icon className="size-4" aria-hidden="true" />
            Menu Publik
          </Link>
          <DarkModeToggle />
          <form action={signOutAction}>
            <Button type="submit" size="sm" variant="ghost">
              <LogOutIcon className="size-4" aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-1 xl:hidden">
          <DarkModeToggle />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t bg-background xl:hidden">
          <nav className="container grid gap-1 py-3">
            {items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} mobile onNavigate={() => setOpen(false)} />
            ))}
            <Link
              href="/"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="mt-2 flex w-full items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition hover:bg-muted hover:text-foreground"
            >
              <Globe2Icon className="size-4" aria-hidden="true" />
              Menu Publik
            </Link>
            <form action={signOutAction} className="mt-2 border-t pt-2">
              <Button type="submit" variant="ghost" className="w-full justify-start px-3">
                <LogOutIcon className="size-4" aria-hidden="true" />
                Keluar
              </Button>
            </form>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
