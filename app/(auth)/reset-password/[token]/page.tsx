import type { Metadata } from "next";

import { ResetPasswordForm } from "@/app/(auth)/reset-password/[token]/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPasswordForm token={params.token} />;
}
