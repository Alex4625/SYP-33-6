import Link from "next/link";
import { UsersRoundIcon } from "lucide-react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b border-white bg-black text-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-sans text-sm font-bold uppercase">
            <span className="catalog-bevel bg-accent p-2 text-black">
              <UsersRoundIcon className="size-4" aria-hidden="true" />
            </span>
            Alumni SYP-33-6
          </Link>
          <DarkModeToggle />
        </div>
      </header>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">{children}</div>
    </main>
  );
}
