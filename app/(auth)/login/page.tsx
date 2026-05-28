import type { Metadata } from "next";

import { LoginForm } from "@/app/(auth)/login/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return <LoginForm />;
}
