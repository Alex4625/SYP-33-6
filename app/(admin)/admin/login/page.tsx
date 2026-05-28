import type { Metadata } from "next";

import { LoginForm } from "@/app/(auth)/login/LoginForm";

export const metadata: Metadata = {
  title: "Masuk Admin",
};

export default function AdminLoginPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <LoginForm admin />
    </div>
  );
}
