"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  CameraIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  Globe2Icon,
  LayoutDashboardIcon,
  LogOutIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/", label: "Lihat Situs", icon: Globe2Icon },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: ClipboardCheckIcon },
  { href: "/admin/alumni", label: "Alumni", icon: UsersIcon },
  { href: "/admin/postingan", label: "Postingan", icon: FileTextIcon },
  { href: "/admin/galeri", label: "Galeri", icon: CameraIcon },
  { href: "/admin/log", label: "Audit Log", icon: BarChart3Icon },
];

export function AdminSidebar({
  pendingCount,
  signOutAction,
}: {
  pendingCount: number;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r bg-sidebar text-sidebar-foreground lg:w-64">
      <div className="border-b p-4">
        <p className="text-sm text-muted-foreground">Panel Admin</p>
        <h1 className="font-semibold">Alumni SYP-33-6</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn("flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent", active && "bg-sidebar-accent font-medium")}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </span>
              {item.href === "/admin/verifikasi" && pendingCount > 0 ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{pendingCount}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="border-t p-3">
        <Button type="submit" variant="ghost" className="w-full justify-start">
          <LogOutIcon className="size-4" aria-hidden="true" />
          Keluar
        </Button>
      </form>
    </aside>
  );
}
