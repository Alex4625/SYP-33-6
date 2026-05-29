"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CameraIcon, Edit3Icon, FilePlus2Icon, Globe2Icon, HomeIcon, LogOutIcon, UsersRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: HomeIcon },
  { href: "/", label: "Lihat Situs", icon: Globe2Icon },
  { href: "/dashboard/profil", label: "Profil", icon: Edit3Icon },
  { href: "/dashboard/postingan", label: "Postingan Saya", icon: FilePlus2Icon },
  { href: "/dashboard/galeri/upload", label: "Upload Galeri", icon: CameraIcon },
  { href: "/dashboard/direktori", label: "Direktori Alumni", icon: UsersRoundIcon },
];

export function AlumniSidebar({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r bg-sidebar text-sidebar-foreground lg:w-64">
      <div className="border-b p-4">
        <p className="text-sm text-muted-foreground">Ruang Alumni</p>
        <h1 className="font-semibold">SYP-33-6</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent", active && "bg-sidebar-accent font-medium")}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
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
