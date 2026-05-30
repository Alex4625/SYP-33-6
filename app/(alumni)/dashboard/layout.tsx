import { AlumniSidebar } from "@/components/shared/AlumniSidebar";
import { signOut } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <div className="hidden lg:block">
        <AlumniSidebar signOutAction={signOutAction} />
      </div>
      <main className="min-w-0 bg-muted/30">
        <div className="border-b bg-background p-3 lg:hidden">
          <AlumniSidebar signOutAction={signOutAction} />
        </div>
        {children}
      </main>
    </div>
  );
}
