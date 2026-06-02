"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormNotice } from "@/components/shared/FormNotice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type ActionFieldErrors } from "@/lib/validations";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-5 text-muted-foreground">{children}</p>;
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-xs leading-5 text-destructive">{errors[0]}</p> : null;
}

export function RegisterForm() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ActionFieldErrors>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setFieldErrors(undefined);

    const formData = new FormData(event.currentTarget);
    const username = formValue(formData, "username");
    const password = formValue(formData, "password");
    const parsed = registerSchema.safeParse({
      fullName: formValue(formData, "fullName"),
      username,
      password,
      confirmPassword: formValue(formData, "confirmPassword"),
      highSchoolMajor: formValue(formData, "highSchoolMajor"),
      collegeMajor: formValue(formData, "collegeMajor"),
      birthPlace: formValue(formData, "birthPlace"),
      birthDate: formValue(formData, "birthDate"),
      email: formValue(formData, "email"),
      phone: formValue(formData, "phone"),
    });

    if (!parsed.success) {
      setError("Periksa kembali format data yang ditandai.");
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        error?: string;
        fieldErrors?: ActionFieldErrors;
        username?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Registrasi belum berhasil. Silakan periksa kembali data Anda.");
        setFieldErrors(result.fieldErrors);
        setPending(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        username: result.username ?? username,
        password,
        redirect: false,
        redirectTo: "/status-akun?status=pending",
      });

      if (!signInResult || signInResult.error) {
        setError("Registrasi berhasil, tetapi sesi login belum bisa dibuat. Silakan masuk manual.");
        setPending(false);
        return;
      }

      window.location.assign(signInResult.url ?? "/status-akun?status=pending");
    } catch {
      setError("Registrasi belum berhasil. Silakan coba lagi.");
      setPending(false);
    }
  }

  function clearClientErrors() {
    if (error || fieldErrors) {
      setError("");
      setFieldErrors(undefined);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Daftar Alumni</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} onInput={clearClientErrors} className="grid gap-4 md:grid-cols-2">
          {error ? <FormNotice className="md:col-span-2" variant="error">{error}</FormNotice> : null}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Nama lengkap</Label>
            <Input id="fullName" name="fullName" placeholder="Contoh: Ahmad Fadli" required />
            <FieldHint>Isi nama asli sesuai identitas, minimal 2 karakter.</FieldHint>
            <FieldError errors={fieldErrors?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="contoh: ahmad_fadli" autoComplete="username" required />
            <FieldHint>3-50 karakter, hanya huruf, angka, dan underscore. Akan dipakai untuk login.</FieldHint>
            <FieldError errors={fieldErrors?.username} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="highSchoolMajor">Jurusan SMA</Label>
            <select
              id="highSchoolMajor"
              name="highSchoolMajor"
              defaultValue=""
              required
              className="h-8 w-full border border-input bg-background px-2 text-sm"
            >
              <option value="">Pilih jurusan</option>
              <option value="IPA">IPA</option>
              <option value="IPS">IPS</option>
            </select>
            <FieldHint>Pilih jurusan saat sekolah di SYP-33-6.</FieldHint>
            <FieldError errors={fieldErrors?.highSchoolMajor} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required />
            <FieldHint>Minimal 8 karakter dan wajib memuat huruf serta angka.</FieldHint>
            <FieldError errors={fieldErrors?.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
            <FieldHint>Ulangi password yang sama persis.</FieldHint>
            <FieldError errors={fieldErrors?.confirmPassword} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="collegeMajor">Program studi kuliah</Label>
            <Input id="collegeMajor" name="collegeMajor" placeholder="Contoh: Teknik Informatika" required />
            <FieldHint>Isi nama program studi atau jurusan kuliah saat ini/terakhir.</FieldHint>
            <FieldError errors={fieldErrors?.collegeMajor} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Tempat lahir</Label>
            <Input id="birthPlace" name="birthPlace" placeholder="Contoh: Makassar" required />
            <FieldHint>Isi kota/kabupaten tempat lahir.</FieldHint>
            <FieldError errors={fieldErrors?.birthPlace} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal lahir</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
            <FieldHint>Gunakan format tanggal dari kalender, tidak boleh tanggal masa depan.</FieldHint>
            <FieldError errors={fieldErrors?.birthDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" autoComplete="email" />
            <FieldHint>Opsional, dipakai untuk reset password jika diisi.</FieldHint>
            <FieldError errors={fieldErrors?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP</Label>
            <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" inputMode="tel" autoComplete="tel" />
            <FieldHint>Opsional, gunakan format 08..., 62..., atau +62..., 9-16 digit angka.</FieldHint>
            <FieldError errors={fieldErrors?.phone} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={pending}>
              <UserPlusIcon className="size-4" aria-hidden="true" />
              {pending ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </div>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Sudah punya akun? <Link href="/login" className="text-primary hover:underline">Masuk di sini</Link>
        </p>
      </CardContent>
    </Card>
  );
}
