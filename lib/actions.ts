"use server";

import { and, eq, gt, inArray } from "drizzle-orm";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCloudflareDb, type Database } from "@/db";
import { adminLogs, alumniProfiles, galleryPhotos, postImages, posts, users, type HighSchoolMajor } from "@/db/schema";
import { auth, signIn } from "@/lib/auth";
import { deleteFromR2, generateR2Key, uploadToR2 } from "@/lib/r2";
import { sendPasswordResetEmail } from "@/lib/resend";
import { createAlumniRegistration } from "@/lib/registration";
import {
  MAX_POST_PHOTO_SIZE,
  MAX_PROFILE_PHOTO_SIZE,
  createPostSchema,
  editProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  uploadGallerySchema,
  validateImageFile,
  type ActionFieldErrors,
} from "@/lib/validations";

export type ActionState = {
  success?: string;
  error?: string;
  fieldErrors?: ActionFieldErrors;
  values?: Record<string, string>;
};

const emptyState: ActionState = {};

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

function readFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((file): file is File => file instanceof File && file.size > 0);
}

async function uploadImage(file: File, folder: string) {
  const key = generateR2Key(folder, file.name);
  const imageUrl = await uploadToR2(await file.arrayBuffer(), key, file.type);
  return { imageUrl, imageKey: key };
}

async function requireAlumni() {
  const session = await auth();

  if (!session || session.user.role !== "ALUMNI" || session.user.status !== "APPROVED") {
    throw new Error("Anda tidak memiliki akses ke halaman ini");
  }

  return session.user;
}

async function requireAdmin() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Anda tidak memiliki akses ke halaman ini");
  }

  return session.user;
}

async function writeAdminLog(
  db: Database,
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string | null,
  description?: string,
) {
  await db.insert(adminLogs).values({
    id: crypto.randomUUID(),
    adminId,
    action,
    targetType,
    targetId,
    description,
  });
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

function socialMediaJson(value: string) {
  if (!value.trim()) return null;

  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return JSON.stringify([{ platform: "Media sosial", url: value.trim() }]);
  }
}

export async function registerAlumni(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const result = await createAlumniRegistration(formData);

  if (!result.ok) {
    return {
      error: result.error,
      fieldErrors: result.fieldErrors,
      values: result.values,
    };
  }

  await signIn("credentials", {
    username: result.username,
    password: stringValue(formData, "password"),
    redirectTo: "/status-akun?status=pending",
  });

  return { success: "Registrasi berhasil, menunggu verifikasi admin." };
}

export async function requestPasswordReset(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const parsed = forgotPasswordSchema.safeParse({
    email: stringValue(formData, "email"),
  });

  if (!parsed.success) {
    return { error: "Email tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = await getCloudflareDb();
  const [profile] = await db
    .select({
      userId: alumniProfiles.userId,
      email: alumniProfiles.email,
      username: users.username,
    })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(eq(alumniProfiles.email, parsed.data.email))
    .limit(1);

  if (profile?.email) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, profile.userId));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(profile.email, `${appUrl}/reset-password/${token}`, profile.username);
  }

  return { success: "Jika email terdaftar, link reset password akan dikirim." };
}

export async function resetPassword(token: string, _state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const parsed = resetPasswordSchema.safeParse({
    password: stringValue(formData, "password"),
    confirmPassword: stringValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { error: "Periksa password baru Anda.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = await getCloudflareDb();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.resetToken, token), gt(users.resetTokenExpires, new Date())))
    .limit(1);

  if (!user) {
    return { error: "Link reset password sudah kadaluarsa. Silakan minta link baru." };
  }

  await db
    .update(users)
    .set({
      passwordHash: await hash(parsed.data.password, 12),
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  redirect("/login?reset=success");
}

export async function updateProfile(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const user = await requireAlumni();
  const parsed = editProfileSchema.safeParse(profileDataFromForm(formData));

  if (!parsed.success) {
    return { error: "Periksa kembali data profil.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = await getCloudflareDb();
  const [profile] = await db.select().from(alumniProfiles).where(eq(alumniProfiles.userId, user.id)).limit(1);

  if (!profile) {
    return { error: "Profil tidak ditemukan." };
  }

  const photo = readFile(formData, "profilePhoto");
  let uploadedPhoto: { imageUrl: string; imageKey: string } | null = null;

  if (photo) {
    const validation = validateImageFile(photo, MAX_PROFILE_PHOTO_SIZE);
    if (!validation.valid) return { error: validation.error };
    uploadedPhoto = await uploadImage(photo, "profiles");
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
      ...(uploadedPhoto
        ? {
            profilePhotoUrl: uploadedPhoto.imageUrl,
            profilePhotoKey: uploadedPhoto.imageKey,
          }
        : {}),
    })
    .where(eq(alumniProfiles.userId, user.id));

  if (uploadedPhoto && profile.profilePhotoKey) {
    await deleteFromR2(profile.profilePhotoKey);
  }

  revalidatePath("/dashboard/profil");
  revalidatePath(`/alumni/${user.username ?? ""}`);
  return { success: "Profil berhasil diperbarui." };
}

export async function createPost(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const user = await requireAlumni();
  const parsed = createPostSchema.safeParse({ caption: stringValue(formData, "caption") });

  if (!parsed.success) {
    return { error: "Caption wajib diisi.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const files = readFiles(formData, "images");
  if (files.length > 4) return { error: "Maksimal 4 foto per postingan." };

  for (const file of files) {
    const validation = validateImageFile(file, MAX_POST_PHOTO_SIZE);
    if (!validation.valid) return { error: validation.error };
  }

  const db = await getCloudflareDb();
  const uploaded: { imageUrl: string; imageKey: string }[] = [];
  const postId = crypto.randomUUID();

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "posts"));
    }

    await db.insert(posts).values({
      id: postId,
      userId: user.id,
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
  } catch (error) {
    await Promise.all(uploaded.map((image) => deleteFromR2(image.imageKey)));
    await db.delete(posts).where(eq(posts.id, postId));
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/postingan");
  redirect("/dashboard/postingan");
}

export async function deleteOwnPost(postId: string) {
  const user = await requireAlumni();
  const db = await getCloudflareDb();
  const [post] = await db.select().from(posts).where(and(eq(posts.id, postId), eq(posts.userId, user.id))).limit(1);

  if (!post) throw new Error("Postingan tidak ditemukan.");

  const images = await db.select().from(postImages).where(eq(postImages.postId, postId));
  await Promise.all(images.map((image) => deleteFromR2(image.imageKey)));
  await db.delete(posts).where(eq(posts.id, postId));
  revalidatePath("/dashboard/postingan");
  revalidatePath("/postingan");
}

export async function uploadGalleryPhoto(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const session = await auth();
  const canUpload =
    session?.user.role === "ADMIN" ||
    (session?.user.role === "ALUMNI" && session.user.status === "APPROVED");

  if (!session || !canUpload) {
    throw new Error("Anda tidak memiliki akses ke halaman ini");
  }

  const parsed = uploadGallerySchema.safeParse({ caption: stringValue(formData, "caption") });
  if (!parsed.success) return { error: "Keterangan tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };

  const file = readFile(formData, "image");
  if (!file) return { error: "Foto wajib dipilih." };

  const validation = validateImageFile(file, MAX_POST_PHOTO_SIZE);
  if (!validation.valid) return { error: validation.error };

  const db = await getCloudflareDb();
  const uploaded = await uploadImage(file, "gallery");
  const photoId = crypto.randomUUID();
  await db.insert(galleryPhotos).values({
    id: photoId,
    uploadedById: session.user.id,
    imageUrl: uploaded.imageUrl,
    imageKey: uploaded.imageKey,
    caption: optional(parsed.data.caption ?? ""),
  });

  revalidatePath("/galeri");
  if (session.user.role === "ADMIN") {
    await writeAdminLog(db, session.user.id, "UPLOAD_GALLERY", "GALLERY", photoId, "Mengunggah foto galeri");
    revalidatePath("/admin/galeri");
  }
  redirect(session.user.role === "ADMIN" ? "/admin/galeri" : "/dashboard");
}

export async function approveAlumni(userId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  await db
    .update(users)
    .set({ status: "APPROVED", rejectionReason: null, updatedAt: new Date() })
    .where(eq(users.id, userId));
  await writeAdminLog(db, admin.id, "APPROVE_ALUMNI", "USER", userId, "Menyetujui registrasi alumni");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/alumni");
}

export async function rejectAlumni(
  stateOrFormData: ActionState | FormData = emptyState,
  maybeFormData?: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const formData = maybeFormData ?? (stateOrFormData as FormData);
  const userId = stringValue(formData, "userId");
  const reason = optional(stringValue(formData, "reason"));

  if (!userId) return { error: "Alumni tidak valid." };

  const db = await getCloudflareDb();
  await db
    .update(users)
    .set({ status: "REJECTED", rejectionReason: reason, updatedAt: new Date() })
    .where(eq(users.id, userId));
  await writeAdminLog(db, admin.id, "REJECT_ALUMNI", "USER", userId, reason ?? "Menolak registrasi alumni");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/alumni");
  return { success: "Registrasi alumni ditolak." };
}

export async function toggleAlumniStatus(userId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  const [user] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Alumni tidak ditemukan.");

  const nextStatus = user.status === "DISABLED" ? "APPROVED" : "DISABLED";
  await db.update(users).set({ status: nextStatus, updatedAt: new Date() }).where(eq(users.id, userId));
  await writeAdminLog(db, admin.id, "TOGGLE_ALUMNI_STATUS", "USER", userId, `Mengubah status alumni menjadi ${nextStatus}`);
  revalidatePath("/admin/alumni");
  revalidatePath(`/admin/alumni/${userId}`);
}

export async function deleteAlumni(userId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user || user.role !== "ALUMNI") throw new Error("Alumni tidak ditemukan.");

  const [profile] = await db.select().from(alumniProfiles).where(eq(alumniProfiles.userId, userId)).limit(1);
  const userPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId));
  const postIds = userPosts.map((post) => post.id);
  const postImageRows = postIds.length ? await db.select().from(postImages).where(inArray(postImages.postId, postIds)) : [];
  const galleryRows = await db.select().from(galleryPhotos).where(eq(galleryPhotos.uploadedById, userId));

  const imageKeys = [
    profile?.profilePhotoKey,
    ...postImageRows.map((image) => image.imageKey),
    ...galleryRows.map((photo) => photo.imageKey),
  ].filter((value): value is string => Boolean(value));

  await Promise.all(imageKeys.map((key) => deleteFromR2(key)));
  await db.delete(users).where(eq(users.id, userId));
  await writeAdminLog(db, admin.id, "DELETE_ALUMNI", "USER", userId, `Menghapus akun ${user.username}`);
  revalidatePath("/admin/alumni");
  redirect("/admin/alumni");
}

export async function adminUpdateAlumni(userId: string, _state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const admin = await requireAdmin();
  const parsed = editProfileSchema.safeParse(profileDataFromForm(formData));

  if (!parsed.success) {
    return { error: "Periksa kembali data alumni.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = await getCloudflareDb();
  await db
    .update(alumniProfiles)
    .set({
      fullName: parsed.data.fullName,
      highSchoolMajor: parsed.data.highSchoolMajor as HighSchoolMajor,
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
    })
    .where(eq(alumniProfiles.userId, userId));

  await writeAdminLog(db, admin.id, "UPDATE_ALUMNI", "USER", userId, "Memperbarui data alumni");
  revalidatePath(`/admin/alumni/${userId}`);
  revalidatePath("/admin/alumni");
  return { success: "Data alumni berhasil diperbarui." };
}

export async function togglePostVisibility(postId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  const [post] = await db.select({ isHidden: posts.isHidden }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) throw new Error("Postingan tidak ditemukan.");

  await db
    .update(posts)
    .set({
      isHidden: !post.isHidden,
      hiddenAt: post.isHidden ? null : new Date(),
      hiddenById: post.isHidden ? null : admin.id,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
  await writeAdminLog(db, admin.id, post.isHidden ? "SHOW_POST" : "HIDE_POST", "POST", postId, "Mengubah visibilitas postingan");
  revalidatePath("/admin/postingan");
  revalidatePath("/postingan");
}

export async function adminDeletePost(postId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) throw new Error("Postingan tidak ditemukan.");

  const images = await db.select().from(postImages).where(eq(postImages.postId, postId));
  await Promise.all(images.map((image) => deleteFromR2(image.imageKey)));
  await db.delete(posts).where(eq(posts.id, postId));
  await writeAdminLog(db, admin.id, "DELETE_POST", "POST", postId, "Menghapus postingan permanen");
  revalidatePath("/admin/postingan");
  revalidatePath("/postingan");
}

export async function toggleGalleryVisibility(photoId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  const [photo] = await db.select({ isHidden: galleryPhotos.isHidden }).from(galleryPhotos).where(eq(galleryPhotos.id, photoId)).limit(1);
  if (!photo) throw new Error("Foto galeri tidak ditemukan.");

  await db
    .update(galleryPhotos)
    .set({
      isHidden: !photo.isHidden,
      hiddenAt: photo.isHidden ? null : new Date(),
      hiddenById: photo.isHidden ? null : admin.id,
    })
    .where(eq(galleryPhotos.id, photoId));
  await writeAdminLog(db, admin.id, photo.isHidden ? "SHOW_GALLERY" : "HIDE_GALLERY", "GALLERY", photoId, "Mengubah visibilitas foto galeri");
  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
}

export async function adminDeleteGalleryPhoto(photoId: string) {
  const admin = await requireAdmin();
  const db = await getCloudflareDb();
  const [photo] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, photoId)).limit(1);
  if (!photo) throw new Error("Foto galeri tidak ditemukan.");

  await deleteFromR2(photo.imageKey);
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, photoId));
  await writeAdminLog(db, admin.id, "DELETE_GALLERY", "GALLERY", photoId, "Menghapus foto galeri permanen");
  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
}
