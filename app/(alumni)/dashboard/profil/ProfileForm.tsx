"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";

import type { AlumniProfile } from "@/db/schema";
import { ProfilePhotoCropper } from "@/components/shared/ProfilePhotoCropper";
import { FormNotice } from "@/components/shared/FormNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function dateValue(date: Date | string) {
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function socialValue(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value);
}

export function ProfileForm({ profile }: { profile: AlumniProfile }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 90_000);

    try {
      const formData = new FormData(event.currentTarget);
      if (profilePhoto) formData.set("profilePhoto", profilePhoto);

      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: Record<string, string[] | undefined>;
      };

      if (!response.ok || !result.success) {
        const firstFieldError = Object.values(result.fieldErrors ?? {}).flat().find(Boolean);
        setError(firstFieldError ?? result.error ?? "Profil belum berhasil diperbarui. Silakan coba lagi.");
        return;
      }

      setSuccess(result.message ?? "Profil berhasil diperbarui.");
      setProfilePhoto(null);
    } catch (error) {
      setError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Penyimpanan terlalu lama. Coba kompres foto atau simpan ulang tanpa mengganti foto."
          : "Profil belum berhasil diperbarui. Silakan coba lagi.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      {success ? <FormNotice className="md:col-span-2" variant="success">{success}</FormNotice> : null}
      {error ? <FormNotice className="md:col-span-2" variant="error">{error}</FormNotice> : null}
      <div className="md:col-span-2">
        <ProfilePhotoCropper currentPhotoUrl={profile.profilePhotoUrl} onChange={setProfilePhoto} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="fullName">Nama lengkap</Label>
        <Input id="fullName" name="fullName" defaultValue={profile.fullName} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="highSchoolMajor">Jurusan SMA</Label>
        <select id="highSchoolMajor" name="highSchoolMajor" defaultValue={profile.highSchoolMajor} className="h-8 w-full border border-input bg-background px-2 text-sm">
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
        <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} rows={5} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          <SaveIcon className="size-4" aria-hidden="true" />
          {pending ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>
    </form>
  );
}
