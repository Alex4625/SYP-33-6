import type { Metadata } from "next";

import { ResetPasswordForm } from "@/app/(auth)/reset-password/[token]/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
};

type Params = { token: string };

export default async function ResetPasswordPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
