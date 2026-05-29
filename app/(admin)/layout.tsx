import { and, count, eq } from "drizzle-orm";

import { getCloudflareDb } from "@/db";
import { users } from "@/db/schema";
import { auth, signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/shared/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  if (!session || session.user.role !== "ADMIN") {
    return <main className="min-h-screen bg-muted/35">{children}</main>;
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
