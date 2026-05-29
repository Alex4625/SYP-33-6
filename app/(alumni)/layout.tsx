import { auth, signOut } from "@/lib/auth";
import { AlumniSidebar } from "@/components/shared/AlumniSidebar";

export const dynamic = "force-dynamic";

export default async function AlumniLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  if (!session || session.user.role !== "ALUMNI" || session.user.status !== "APPROVED") {
    return <main className="min-h-screen bg-muted/35">{children}</main>;
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
