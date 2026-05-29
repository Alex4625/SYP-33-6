import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masuk Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <LoginForm admin />
    </div>
  );
}
