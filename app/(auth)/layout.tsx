import Link from "next/link";
import { UsersRoundIcon } from "lucide-react";

import { DarkModeToggle } from "@/components/shared/DarkModeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-muted/40">
      <div className="container flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="rounded-md bg-primary p-2 text-primary-foreground">
              <UsersRoundIcon className="size-4" aria-hidden="true" />
            </span>
            Alumni SYP-33-6
          </Link>
          <DarkModeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </div>
    </main>
  );
}
