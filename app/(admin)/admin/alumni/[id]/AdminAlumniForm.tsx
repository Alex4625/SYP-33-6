"use client";

import { useActionState } from "react";
import { SaveIcon } from "lucide-react";

import type { AlumniProfile } from "@/db/schema";
import { adminUpdateAlumni } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function dateValue(date: Date | string) {
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function socialValue(value: string | null) {
  if (!value) return "";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function AdminAlumniForm({ userId, profile }: { userId: string; profile: AlumniProfile }) {
  const action = adminUpdateAlumni.bind(null, userId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {state.success ? <p className="md:col-span-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{state.success}</p> : null}
      {state.error ? <p className="md:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="fullName">Nama lengkap</Label>
        <Input id="fullName" name="fullName" defaultValue={profile.fullName} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="highSchoolMajor">Jurusan SMA</Label>
        <select id="highSchoolMajor" name="highSchoolMajor" defaultValue={profile.highSchoolMajor} className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm">
          <option value="IPA">IPA</option>
          <option value="IPS">IPS</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="collegeMajor">Program studi kuliah</Label>
        <Input id="collegeMajor" name="collegeMajor" defaultValue={profile.collegeMajor} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthPlace">Tempat lahir</Label>
        <Input id="birthPlace" name="birthPlace" defaultValue={profile.birthPlace} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthDate">Tanggal lahir</Label>
        <Input id="birthDate" name="birthDate" type="date" defaultValue={dateValue(profile.birthDate)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Nomor HP</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea id="address" name="address" defaultValue={profile.address ?? ""} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domicileCity">Kota domisili</Label>
        <Input id="domicileCity" name="domicileCity" defaultValue={profile.domicileCity ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domicileProvince">Provinsi domisili</Label>
        <Input id="domicileProvince" name="domicileProvince" defaultValue={profile.domicileProvince ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="originCity">Kota asal</Label>
        <Input id="originCity" name="originCity" defaultValue={profile.originCity ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="originProvince">Provinsi asal</Label>
        <Input id="originProvince" name="originProvince" defaultValue={profile.originProvince ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn</Label>
        <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile.linkedinUrl ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolioUrl">Portofolio</Label>
        <Input id="portfolioUrl" name="portfolioUrl" defaultValue={profile.portfolioUrl ?? ""} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="socialMedia">Media sosial</Label>
        <Textarea id="socialMedia" name="socialMedia" defaultValue={socialValue(profile.socialMedia)} rows={3} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} rows={4} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          <SaveIcon className="size-4" aria-hidden="true" />
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
