import { DashboardNavbar } from "@/components/shared/DashboardNavbar";
import { signOut } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNavbar role="ALUMNI" signOutAction={signOutAction} />
      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}
