import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCloudflareDb } from "@/db";
import { alumniProfiles } from "@/db/schema";
import { auth } from "@/lib/auth";
import { deleteFromR2, generateR2Key, uploadToR2 } from "@/lib/r2";
import { editProfileSchema, MAX_PROFILE_PHOTO_SIZE, validateImageFile } from "@/lib/validations";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readFile(formData: FormData, key: string) {
  const file = formData.get(key);
  if (file instanceof File && file.size > 0) return file;
  return null;
}

function socialMediaJson(value: string) {
  if (!value.trim()) return null;

  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return JSON.stringify([{ platform: "Media sosial", url: value.trim() }]);
  }
}

function profileDataFromForm(formData: FormData) {
  return {
    fullName: stringValue(formData, "fullName"),
    highSchoolMajor: stringValue(formData, "highSchoolMajor"),
    collegeMajor: stringValue(formData, "collegeMajor"),
    birthPlace: stringValue(formData, "birthPlace"),
    birthDate: stringValue(formData, "birthDate"),
    email: stringValue(formData, "email"),
    phone: stringValue(formData, "phone"),
    address: stringValue(formData, "address"),
    domicileCity: stringValue(formData, "domicileCity"),
    domicileProvince: stringValue(formData, "domicileProvince"),
    originCity: stringValue(formData, "originCity"),
    originProvince: stringValue(formData, "originProvince"),
    linkedinUrl: stringValue(formData, "linkedinUrl"),
    portfolioUrl: stringValue(formData, "portfolioUrl"),
    socialMedia: stringValue(formData, "socialMedia"),
    bio: stringValue(formData, "bio"),
  };
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ALUMNI" || session.user.status !== "APPROVED") {
    return jsonError("Anda tidak memiliki akses untuk memperbarui profil.", 403);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Data profil tidak dapat dibaca. Silakan coba lagi.");
  }

  const parsed = editProfileSchema.safeParse(profileDataFromForm(formData));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa kembali data profil.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const photo = readFile(formData, "profilePhoto");
  if (photo) {
    const validation = validateImageFile(photo, MAX_PROFILE_PHOTO_SIZE);
    if (!validation.valid) return jsonError(validation.error ?? "Foto profil tidak valid.");
  }

  const db = await getCloudflareDb();
  const [profile] = await db
    .select()
    .from(alumniProfiles)
    .where(eq(alumniProfiles.userId, session.user.id))
    .limit(1);

  if (!profile) return jsonError("Profil tidak ditemukan.", 404);

  const imageKey = photo ? generateR2Key("profiles", photo.name) : null;
  let imageUrl: string | null = null;

  try {
    if (photo && imageKey) {
      imageUrl = await uploadToR2(await photo.arrayBuffer(), imageKey, photo.type);
    }

    await db
      .update(alumniProfiles)
      .set({
        fullName: parsed.data.fullName,
        highSchoolMajor: parsed.data.highSchoolMajor,
        collegeMajor: parsed.data.collegeMajor,
        birthPlace: parsed.data.birthPlace,
        birthDate: parsed.data.birthDate,
        email: optional(parsed.data.email ?? ""),
        phone: optional(parsed.data.phone ?? ""),
        address: optional(parsed.data.address ?? ""),
        domicileCity: optional(parsed.data.domicileCity ?? ""),
        domicileProvince: optional(parsed.data.domicileProvince ?? ""),
        originCity: optional(parsed.data.originCity ?? ""),
        originProvince: optional(parsed.data.originProvince ?? ""),
        linkedinUrl: optional(parsed.data.linkedinUrl ?? ""),
        portfolioUrl: optional(parsed.data.portfolioUrl ?? ""),
        socialMedia: socialMediaJson(parsed.data.socialMedia ?? ""),
        bio: optional(parsed.data.bio ?? ""),
        updatedAt: new Date(),
        ...(imageUrl && imageKey
          ? {
              profilePhotoUrl: imageUrl,
              profilePhotoKey: imageKey,
            }
          : {}),
      })
      .where(eq(alumniProfiles.userId, session.user.id));

    if (imageUrl && profile.profilePhotoKey) {
      await deleteFromR2(profile.profilePhotoKey).catch(() => undefined);
    }

    revalidatePath("/");
    revalidatePath("/alumni");
    revalidatePath(`/alumni/${session.user.username ?? ""}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profil");

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui." });
  } catch (error) {
    if (imageKey) {
      await deleteFromR2(imageKey).catch(() => undefined);
    }

    console.error("Gagal memperbarui profil", error);
    return jsonError("Profil belum berhasil diperbarui. Silakan coba lagi.", 500);
  }
}
