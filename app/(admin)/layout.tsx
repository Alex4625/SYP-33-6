import { auth, signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { prisma } from "@/lib/prisma";

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

  const pendingCount = await prisma.user.count({
    where: { role: "ALUMNI", status: "PENDING" },
  });

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
