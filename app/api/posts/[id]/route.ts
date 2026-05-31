import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { getCloudflareDb } from "@/db";
import { postImages, posts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { deleteFromR2, generateR2Key, uploadToR2 } from "@/lib/r2";
import { createPostSchema, MAX_POST_PHOTO_SIZE, validateImageFile } from "@/lib/validations";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((file): file is File => file instanceof File && file.size > 0);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ALUMNI" || session.user.status !== "APPROVED") {
    return jsonError("Anda tidak memiliki akses untuk mengubah postingan.", 403);
  }

  const { id: postId } = await params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Data postingan tidak dapat dibaca. Silakan coba lagi.");
  }

  const parsed = createPostSchema.safeParse({ caption: stringValue(formData, "caption") });
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa kembali caption postingan.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const db = await getCloudflareDb();
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, session.user.id)))
    .limit(1);
  if (!post) return jsonError("Postingan tidak ditemukan.", 404);

  const existingImages = await db
    .select()
    .from(postImages)
    .where(eq(postImages.postId, postId));
  const existingIds = new Set(existingImages.map((image) => image.id));
  const removeIds = Array.from(
    new Set(
      formData
        .getAll("removeImageIds")
        .filter((value): value is string => typeof value === "string" && existingIds.has(value)),
    ),
  );
  const removeSet = new Set(removeIds);
  const remainingImages = existingImages.filter((image) => !removeSet.has(image.id));
  const newFiles = readFiles(formData, "images");

  if (remainingImages.length + newFiles.length > 4) {
    return jsonError("Maksimal 4 foto per postingan. Hapus foto lama sebelum menambahkan foto baru.");
  }

  for (const file of newFiles) {
    const validation = validateImageFile(file, MAX_POST_PHOTO_SIZE);
    if (!validation.valid) return jsonError(validation.error ?? "Foto postingan tidak valid.");
  }

  const uploaded: { id: string; imageUrl: string; imageKey: string; orderIndex: number }[] = [];

  try {
    for (const [index, file] of newFiles.entries()) {
      const imageKey = generateR2Key("posts", file.name);
      uploaded.push({
        id: crypto.randomUUID(),
        imageUrl: await uploadToR2(await file.arrayBuffer(), imageKey, file.type),
        imageKey,
        orderIndex: remainingImages.length + index,
      });
    }

    if (uploaded.length) {
      await db.insert(postImages).values(
        uploaded.map((image) => ({
          id: image.id,
          postId,
          imageUrl: image.imageUrl,
          imageKey: image.imageKey,
          orderIndex: image.orderIndex,
        })),
      );
    }

    await db
      .update(posts)
      .set({ caption: parsed.data.caption, updatedAt: new Date() })
      .where(eq(posts.id, postId));

    if (removeIds.length) {
      await db.delete(postImages).where(inArray(postImages.id, removeIds));
      const removedImages = existingImages.filter((image) => removeSet.has(image.id));
      await Promise.all(removedImages.map((image) => deleteFromR2(image.imageKey).catch(() => undefined)));
    }

    revalidatePath("/");
    revalidatePath("/postingan");
    revalidatePath(`/alumni/${session.user.username ?? ""}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/postingan");
    revalidatePath(`/dashboard/postingan/${postId}/edit`);

    return NextResponse.json({ success: true, redirectTo: "/dashboard/postingan" });
  } catch (error) {
    if (uploaded.length) {
      await db.delete(postImages).where(inArray(postImages.id, uploaded.map((image) => image.id))).catch(() => undefined);
      await Promise.all(uploaded.map((image) => deleteFromR2(image.imageKey).catch(() => undefined)));
    }
    console.error("Gagal memperbarui postingan", error);
    return jsonError("Postingan belum berhasil diperbarui. Silakan coba lagi.", 500);
  }
}
