import { and, count, eq } from "drizzle-orm";

import { getCloudflareDb } from "@/db";
import { users } from "@/db/schema";
import { signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/shared/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const db = await getCloudflareDb();
  const [pending] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, "ALUMNI"), eq(users.status, "PENDING")));
  const pendingCount = pending?.value ?? 0;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <div className="hidden lg:block">
        <AdminSidebar pendingCount={pendingCount} signOutAction={signOutAction} />
      </div>
      <main className="min-w-0 bg-muted/30">
        <div className="border-b bg-background p-3 lg:hidden">
          <AdminSidebar pendingCount={pendingCount} signOutAction={signOutAction} />
        </div>
        {children}
      </main>
    </div>
  );
}
