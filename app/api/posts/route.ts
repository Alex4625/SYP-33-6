import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ALUMNI" || session.user.status !== "APPROVED") {
    return jsonError("Anda tidak memiliki akses untuk membuat postingan.", 403);
  }

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
        error: "Caption wajib diisi.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const files = readFiles(formData, "images");
  if (files.length > 4) return jsonError("Maksimal 4 foto per postingan.");

  for (const file of files) {
    const validation = validateImageFile(file, MAX_POST_PHOTO_SIZE);
    if (!validation.valid) return jsonError(validation.error ?? "Foto postingan tidak valid.");
  }

  const db = await getCloudflareDb();
  const postId = crypto.randomUUID();
  const uploaded: { imageUrl: string; imageKey: string }[] = [];

  try {
    for (const file of files) {
      const imageKey = generateR2Key("posts", file.name);
      uploaded.push({
        imageUrl: await uploadToR2(await file.arrayBuffer(), imageKey, file.type),
        imageKey,
      });
    }

    await db.insert(posts).values({
      id: postId,
      userId: session.user.id,
      caption: parsed.data.caption,
    });

    if (uploaded.length > 0) {
      await db.insert(postImages).values(
        uploaded.map((image, index) => ({
          id: crypto.randomUUID(),
          postId,
          imageUrl: image.imageUrl,
          imageKey: image.imageKey,
          orderIndex: index,
        })),
      );
    }

    revalidatePath("/");
    revalidatePath("/postingan");
    revalidatePath(`/alumni/${session.user.username ?? ""}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/postingan");

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard/postingan",
    });
  } catch (error) {
    await Promise.all(uploaded.map((image) => deleteFromR2(image.imageKey).catch(() => undefined)));
    await db.delete(posts).where(eq(posts.id, postId)).catch(() => undefined);

    console.error("Gagal membuat postingan", error);
    return jsonError("Postingan belum berhasil diterbitkan. Silakan coba lagi.", 500);
  }
}
