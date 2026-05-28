"use client";

import Link from "next/link";
import { useActionState } from "react";
import { UserPlusIcon } from "lucide-react";

import { registerAlumni } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAlumni, {});

  return (
    <Card className="w-full max-w-2xl rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>Daftar Alumni</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          {state.error ? <p className="md:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Nama lengkap</Label>
            <Input id="fullName" name="fullName" required />
            {state.fieldErrors?.fullName ? <p className="text-xs text-destructive">{state.fieldErrors.fullName[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" required />
            {state.fieldErrors?.username ? <p className="text-xs text-destructive">{state.fieldErrors.username[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="highSchoolMajor">Jurusan SMA</Label>
            <select id="highSchoolMajor" name="highSchoolMajor" required className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm">
              <option value="">Pilih jurusan</option>
              <option value="IPA">IPA</option>
              <option value="IPS">IPS</option>
            </select>
            {state.fieldErrors?.highSchoolMajor ? <p className="text-xs text-destructive">{state.fieldErrors.highSchoolMajor[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state.fieldErrors?.password ? <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {state.fieldErrors?.confirmPassword ? <p className="text-xs text-destructive">{state.fieldErrors.confirmPassword[0]}</p> : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="collegeMajor">Program studi kuliah</Label>
            <Input id="collegeMajor" name="collegeMajor" required />
            {state.fieldErrors?.collegeMajor ? <p className="text-xs text-destructive">{state.fieldErrors.collegeMajor[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Tempat lahir</Label>
            <Input id="birthPlace" name="birthPlace" required />
            {state.fieldErrors?.birthPlace ? <p className="text-xs text-destructive">{state.fieldErrors.birthPlace[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal lahir</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
            {state.fieldErrors?.birthDate ? <p className="text-xs text-destructive">{state.fieldErrors.birthDate[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
            {state.fieldErrors?.email ? <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP</Label>
            <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" />
            {state.fieldErrors?.phone ? <p className="text-xs text-destructive">{state.fieldErrors.phone[0]}</p> : null}
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
