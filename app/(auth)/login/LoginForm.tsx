"use client";

import Link from "next/link";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2Icon, LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") === "disabled" ? "Akun Anda telah dinonaktifkan" : "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
      remember: formData.get("remember") ? "on" : undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Periksa kembali isian Anda");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      remember: parsed.data.remember,
      redirect: false,
    });

    if (!result?.ok) {
      setError(result?.error === "DISABLED" ? "Akun Anda telah dinonaktifkan" : "Username atau password salah");
      setLoading(false);
      return;
    }

    // Tunggu sebentar untuk memastikan session ter-update
    await new Promise(resolve => setTimeout(resolve, 100));

    const session = await getSession();
    if (!session?.user) {
      setError("Sesi login tidak dapat dibuat. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    if (admin) {
      if (session.user.role !== "ADMIN") {
        await signOut({ redirect: false });
        setError("Akun ini bukan akun admin.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      return;
    }

    if (session.user.status === "APPROVED") router.push("/dashboard");
    else if (session.user.status === "PENDING" || session.user.status === "REJECTED") router.push("/status-akun");
    else router.push("/login?error=disabled");
  }

  return (
    <Card className="w-full max-w-md rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>{admin ? "Masuk Admin" : "Masuk Alumni"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          {searchParams.get("reset") === "success" ? (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
              Password berhasil diubah. Silakan masuk kembali.
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" autoComplete="username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input name="remember" type="checkbox" className="size-4 rounded border-input" />
            Ingat Saya
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : <LogInIcon className="size-4" />}
            Masuk
          </Button>
        </form>
        {!admin ? (
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
            <Link href="/lupa-password" className="text-primary hover:underline">Lupa password?</Link>
            <Link href="/daftar" className="text-primary hover:underline">Daftar alumni</Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
