import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCloudflareDb } from "@/db";
import { adminLogs, galleryPhotos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { deleteFromR2, generateR2Key, uploadToR2 } from "@/lib/r2";
import { MAX_POST_PHOTO_SIZE, uploadGallerySchema, validateImageFile } from "@/lib/validations";

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

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  const canUpload =
    session?.user.role === "ADMIN" ||
    (session?.user.role === "ALUMNI" && session.user.status === "APPROVED");

  if (!session || !canUpload) {
    return jsonError("Anda tidak memiliki akses untuk mengunggah foto.", 403);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Data upload tidak dapat dibaca. Silakan pilih foto lagi.");
  }

  const parsed = uploadGallerySchema.safeParse({ caption: stringValue(formData, "caption") });
  if (!parsed.success) {
    return jsonError("Keterangan tidak valid.");
  }

  const file = readFile(formData, "image");
  if (!file) {
    return jsonError("Foto wajib dipilih.");
  }

  const validation = validateImageFile(file, MAX_POST_PHOTO_SIZE);
  if (!validation.valid) {
    return jsonError(validation.error ?? "Foto tidak valid.");
  }

  const db = await getCloudflareDb();
  const photoId = crypto.randomUUID();
  const imageKey = generateR2Key("gallery", file.name);

  try {
    const imageUrl = await uploadToR2(await file.arrayBuffer(), imageKey, file.type);

    await db.insert(galleryPhotos).values({
      id: photoId,
      uploadedById: session.user.id,
      imageUrl,
      imageKey,
      caption: optional(parsed.data.caption ?? ""),
    });

    if (session.user.role === "ADMIN") {
      await db.insert(adminLogs).values({
        id: crypto.randomUUID(),
        adminId: session.user.id,
        action: "UPLOAD_GALLERY",
        targetType: "GALLERY",
        targetId: photoId,
        description: "Mengunggah foto galeri",
      });
      revalidatePath("/admin/galeri");
    }

    revalidatePath("/galeri");

    return NextResponse.json({
      success: true,
      redirectTo: session.user.role === "ADMIN" ? "/admin/galeri" : "/dashboard/galeri",
    });
  } catch (error) {
    await deleteFromR2(imageKey).catch(() => undefined);
    console.error("Gagal mengunggah foto galeri", error);
    return jsonError("Foto belum berhasil diunggah. Silakan coba lagi.", 500);
  }
}
