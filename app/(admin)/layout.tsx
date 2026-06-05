import { and, count, eq } from "drizzle-orm";

import { getCloudflareDb } from "@/db";
import { users } from "@/db/schema";
import { signOut } from "@/lib/auth";
import { getTodayBirthdays } from "@/lib/birthdays";
import { DashboardNavbar } from "@/components/shared/DashboardNavbar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const db = await getCloudflareDb();
  const [pendingRows, todayBirthdays] = await Promise.all([
    db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, "ALUMNI"), eq(users.status, "PENDING"))),
    getTodayBirthdays(db),
  ]);
  const pending = pendingRows[0];
  const pendingCount = pending?.value ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNavbar role="ADMIN" pendingCount={pendingCount} birthdayCount={todayBirthdays.length} signOutAction={signOutAction} />
      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}
