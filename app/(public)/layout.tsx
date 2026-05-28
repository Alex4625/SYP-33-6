import Link from "next/link";

import { Navbar } from "@/components/shared/Navbar";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card">
        <div className="container grid gap-4 py-8 text-sm text-muted-foreground md:flex md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Alumni SYP-33-6. Semua hak dilindungi.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/alumni" className="hover:text-foreground">Direktori</Link>
            <Link href="/postingan" className="hover:text-foreground">Postingan</Link>
            <Link href="/galeri" className="hover:text-foreground">Galeri</Link>
            <Link href="/admin/login" className="hover:text-foreground">Admin</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
