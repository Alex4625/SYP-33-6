import { DashboardNavbar } from "@/components/shared/DashboardNavbar";
import { signOut } from "@/lib/auth";
import { getTodayBirthdays } from "@/lib/birthdays";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const todayBirthdays = await getTodayBirthdays();

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNavbar role="ALUMNI" birthdayCount={todayBirthdays.length} signOutAction={signOutAction} />
      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}
