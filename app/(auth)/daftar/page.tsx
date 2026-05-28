import type { Metadata } from "next";

import { RegisterForm } from "@/app/(auth)/daftar/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
