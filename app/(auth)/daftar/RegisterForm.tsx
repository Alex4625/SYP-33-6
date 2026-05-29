"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { UserPlusIcon } from "lucide-react";

import { registerAlumni } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [state, formAction, pending] = useActionState(registerAlumni, {});
  const [clientError, setClientError] = useState("");
  const [clientFieldErrors, setClientFieldErrors] = useState<ActionFieldErrors>();
  const fieldErrors = clientFieldErrors ?? state.fieldErrors;
  const formError = clientError || state.error;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      fullName: formValue(formData, "fullName"),
      username: formValue(formData, "username"),
      password: formValue(formData, "password"),
      confirmPassword: formValue(formData, "confirmPassword"),
      highSchoolMajor: formValue(formData, "highSchoolMajor"),
      collegeMajor: formValue(formData, "collegeMajor"),
      birthPlace: formValue(formData, "birthPlace"),
      birthDate: formValue(formData, "birthDate"),
      email: formValue(formData, "email"),
      phone: formValue(formData, "phone"),
    });

    if (!parsed.success) {
      event.preventDefault();
      setClientError("Periksa kembali format data yang ditandai.");
      setClientFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setClientError("");
    setClientFieldErrors(undefined);
  }

  function clearClientErrors() {
    if (clientError || clientFieldErrors) {
      setClientError("");
      setClientFieldErrors(undefined);
    }
  }

  return (
    <Card className="w-full max-w-2xl rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>Daftar Alumni</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} onSubmit={handleSubmit} onInput={clearClientErrors} className="grid gap-4 md:grid-cols-2">
          {formError ? <p className="md:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Nama lengkap</Label>
            <Input id="fullName" name="fullName" placeholder="Contoh: Ahmad Fadli" defaultValue={state.values?.fullName ?? ""} required />
            <FieldHint>Isi nama asli sesuai identitas, minimal 2 karakter.</FieldHint>
            <FieldError errors={fieldErrors?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="contoh: ahmad_fadli" defaultValue={state.values?.username ?? ""} autoComplete="username" required />
            <FieldHint>3-50 karakter, hanya huruf, angka, dan underscore. Akan dipakai untuk login.</FieldHint>
            <FieldError errors={fieldErrors?.username} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="highSchoolMajor">Jurusan SMA</Label>
            <select
              id="highSchoolMajor"
              name="highSchoolMajor"
              defaultValue={state.values?.highSchoolMajor ?? ""}
              required
              className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
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
            <Input id="collegeMajor" name="collegeMajor" placeholder="Contoh: Teknik Informatika" defaultValue={state.values?.collegeMajor ?? ""} required />
            <FieldHint>Isi nama program studi atau jurusan kuliah saat ini/terakhir.</FieldHint>
            <FieldError errors={fieldErrors?.collegeMajor} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Tempat lahir</Label>
            <Input id="birthPlace" name="birthPlace" placeholder="Contoh: Makassar" defaultValue={state.values?.birthPlace ?? ""} required />
            <FieldHint>Isi kota/kabupaten tempat lahir.</FieldHint>
            <FieldError errors={fieldErrors?.birthPlace} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal lahir</Label>
            <Input id="birthDate" name="birthDate" type="date" defaultValue={state.values?.birthDate ?? ""} required />
            <FieldHint>Gunakan format tanggal dari kalender, tidak boleh tanggal masa depan.</FieldHint>
            <FieldError errors={fieldErrors?.birthDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" defaultValue={state.values?.email ?? ""} autoComplete="email" />
            <FieldHint>Opsional, dipakai untuk reset password jika diisi.</FieldHint>
            <FieldError errors={fieldErrors?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP</Label>
            <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" defaultValue={state.values?.phone ?? ""} inputMode="tel" autoComplete="tel" />
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
