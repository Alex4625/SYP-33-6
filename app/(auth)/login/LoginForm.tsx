"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2Icon, LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const searchParams = useSearchParams();
  const initialError =
    searchParams.get("error") === "disabled"
      ? "Akun Anda telah dinonaktifkan"
      : searchParams.get("error") === "not-admin"
        ? "Akun ini bukan akun admin."
        : searchParams.get("error") === "session"
          ? "Sesi login tidak dapat dibuat. Silakan coba lagi."
          : "";
  const [error, setError] = useState(initialError);
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
      redirectTo: admin ? "/masuk/lanjut?target=admin" : "/masuk/lanjut",
    });

    if (!result) {
      setError("Login tidak berhasil. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    if (result.error) {
      setError(result.code === "disabled" ? "Akun Anda telah dinonaktifkan" : "Username atau password salah");
      setLoading(false);
      return;
    }

    window.location.assign(result.url ?? (admin ? "/admin" : "/masuk/lanjut"));
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
