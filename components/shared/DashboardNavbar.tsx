"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  CameraIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  FilePlus2Icon,
  FileTextIcon,
  HomeIcon,
  ImageIcon,
  LogOutIcon,
  MenuIcon,
  PencilIcon,
  UsersIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  badge?: number;
};

const publicItems: NavItem[] = [
  { href: "/alumni", label: "Direktori", icon: UsersRoundIcon },
  { href: "/postingan", label: "Postingan Publik", icon: FileTextIcon },
  { href: "/galeri", label: "Galeri Publik", icon: ImageIcon },
];

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
  hardNavigation = false,
}: {
  item: NavItem;
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
  hardNavigation?: boolean;
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

  return hardNavigation ? (
    <a href={item.href} onClick={onNavigate} className={className}>
      {content}
    </a>
  ) : (
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
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const publicMenuRef = useRef<HTMLDivElement>(null);
  const items = workspaceItems(role, pendingCount);
  const homeHref = role === "ADMIN" ? "/admin" : "/dashboard";

  useEffect(() => {
    if (!publicMenuOpen) return;

    function closeOnPointerDown(event: MouseEvent) {
      if (!publicMenuRef.current?.contains(event.target as Node)) setPublicMenuOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPublicMenuOpen(false);
    }

    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [publicMenuOpen]);

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
          <div ref={publicMenuRef} className="relative">
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-haspopup="menu"
              aria-expanded={publicMenuOpen}
              onClick={() => setPublicMenuOpen((current) => !current)}
            >
              Menu Publik
              <ChevronDownIcon className="size-3.5" aria-hidden="true" />
            </Button>
            {publicMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              >
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Halaman yang dilihat pengunjung
                </p>
                <div className="my-1 h-px bg-border" />
                {publicItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setPublicMenuOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
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
            <p className="mt-2 px-3 text-xs font-medium text-muted-foreground">Menu Publik</p>
            {publicItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                mobile
                hardNavigation
                onNavigate={() => setOpen(false)}
              />
            ))}
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
