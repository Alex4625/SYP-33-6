import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/app/(auth)/lupa-password/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
