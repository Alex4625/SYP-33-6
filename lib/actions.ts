"use server";

import { AccountStatus, type HighSchoolMajor, type Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/lib/auth";
import { deleteFromCloudinary, uploadToCloudinary, type CloudinaryUploadResult } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/resend";
import {
  createPostSchema,
  editProfileSchema,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  uploadGallerySchema,
  type ActionFieldErrors,
} from "@/lib/validations";

export type ActionState = {
  success?: string;
  error?: string;
  fieldErrors?: ActionFieldErrors;
};

const emptyState: ActionState = {};
const imageTypes = ["image/jpeg", "image/png", "image/webp"];

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

function validateImageFile(file: File, maxSizeMb: number) {
  if (!imageTypes.includes(file.type)) {
    return "Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.";
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return `Ukuran file melebihi batas ${maxSizeMb}MB. Pilih file yang lebih kecil.`;
  }

  return null;
}

async function fileToBuffer(file: File) {
  return Buffer.from(await file.arrayBuffer());
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
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string | null,
  description?: string,
) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      description,
    },
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

function socialMediaJson(value: string): Prisma.InputJsonValue | undefined {
  if (!value.trim()) return undefined;

  try {
    return JSON.parse(value) as Prisma.InputJsonValue;
  } catch {
    return [{ platform: "Media sosial", url: value.trim() }];
  }
}

/**
 * Daftarkan alumni baru dengan status PENDING.
 */
export async function registerAlumni(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const parsed = registerSchema.safeParse({
    fullName: stringValue(formData, "fullName"),
    username: stringValue(formData, "username"),
    password: stringValue(formData, "password"),
    confirmPassword: stringValue(formData, "confirmPassword"),
    highSchoolMajor: stringValue(formData, "highSchoolMajor"),
    collegeMajor: stringValue(formData, "collegeMajor"),
    birthPlace: stringValue(formData, "birthPlace"),
    birthDate: stringValue(formData, "birthDate"),
    email: stringValue(formData, "email"),
    phone: stringValue(formData, "phone"),
  });

  if (!parsed.success) {
    return { error: "Periksa kembali data registrasi.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Username sudah digunakan, silakan pilih yang lain", fieldErrors: { username: ["Username sudah digunakan"] } };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        role: "ALUMNI",
        status: "PENDING",
      },
    });

    await tx.alumniProfile.create({
      data: {
        userId: user.id,
        fullName: parsed.data.fullName,
        highSchoolMajor: parsed.data.highSchoolMajor,
        collegeMajor: parsed.data.collegeMajor,
        birthPlace: parsed.data.birthPlace,
        birthDate: new Date(parsed.data.birthDate),
        email: optional(parsed.data.email ?? ""),
        phone: optional(parsed.data.phone ?? ""),
      },
    });
  });

  await signIn("credentials", {
    username: parsed.data.username,
    password: parsed.data.password,
    redirectTo: "/status-akun?status=pending",
  });

  return { success: "Registrasi berhasil, menunggu verifikasi admin." };
}

/**
 * Kirim tautan reset password jika email terdaftar.
 */
export async function requestPasswordReset(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const parsed = forgotPasswordSchema.safeParse({
    email: stringValue(formData, "email"),
  });

  if (!parsed.success) {
    return { error: "Email tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const profile = await prisma.alumniProfile.findFirst({
    where: { email: parsed.data.email },
    include: { user: true },
  });

  if (profile) {
    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(profile.email!, `${appUrl}/reset-password/${token}`, profile.user.username);
  }

  return { success: "Jika email terdaftar, link reset password akan dikirim." };
}

/**
 * Simpan password baru berdasarkan token reset yang masih berlaku.
 */
export async function resetPassword(token: string, _state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const parsed = resetPasswordSchema.safeParse({
    password: stringValue(formData, "password"),
    confirmPassword: stringValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { error: "Periksa password baru Anda.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return { error: "Link reset password sudah kadaluarsa. Silakan minta link baru." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hash(parsed.data.password, 12),
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  redirect("/login?reset=success");
}

/**
 * Perbarui profil alumni yang sedang login.
 */
export async function updateProfile(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const user = await requireAlumni();
  const parsed = editProfileSchema.safeParse(profileDataFromForm(formData));

  if (!parsed.success) {
    return { error: "Periksa kembali data profil.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const profile = await prisma.alumniProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { error: "Profil tidak ditemukan." };
  }

  const photo = readFile(formData, "profilePhoto");
  let uploadedPhoto: CloudinaryUploadResult | null = null;

  if (photo) {
    const fileError = validateImageFile(photo, 2);
    if (fileError) return { error: fileError };
    uploadedPhoto = await uploadToCloudinary(await fileToBuffer(photo), "profiles");
  }

  await prisma.alumniProfile.update({
    where: { userId: user.id },
    data: {
      fullName: parsed.data.fullName,
      highSchoolMajor: parsed.data.highSchoolMajor,
      collegeMajor: parsed.data.collegeMajor,
      birthPlace: parsed.data.birthPlace,
      birthDate: new Date(parsed.data.birthDate),
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
      ...(uploadedPhoto
        ? {
            profilePhotoUrl: uploadedPhoto.imageUrl,
            profilePhotoPublicId: uploadedPhoto.imagePublicId,
          }
        : {}),
    },
  });

  if (uploadedPhoto && profile.profilePhotoPublicId) {
    await deleteFromCloudinary(profile.profilePhotoPublicId);
  }

  revalidatePath("/dashboard/profil");
  revalidatePath(`/alumni/${user.username ?? user.name ?? ""}`);
  return { success: "Profil berhasil diperbarui." };
}

/**
 * Buat postingan alumni dengan foto opsional.
 */
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
    const fileError = validateImageFile(file, 5);
    if (fileError) return { error: fileError };
  }

  const uploaded: CloudinaryUploadResult[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadToCloudinary(await fileToBuffer(file), "posts"));
    }

    await prisma.post.create({
      data: {
        userId: user.id,
        caption: parsed.data.caption,
        images: {
          create: uploaded.map((image, index) => ({
            imageUrl: image.imageUrl,
            imagePublicId: image.imagePublicId,
            orderIndex: index,
          })),
        },
      },
    });
  } catch (error) {
    await Promise.all(uploaded.map((image) => deleteFromCloudinary(image.imagePublicId)));
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/postingan");
  redirect("/dashboard/postingan");
}

/**
 * Hapus postingan milik alumni yang sedang login.
 */
export async function deleteOwnPost(postId: string) {
  const user = await requireAlumni();
  const post = await prisma.post.findFirst({
    where: { id: postId, userId: user.id },
    include: { images: true },
  });

  if (!post) throw new Error("Postingan tidak ditemukan.");

  await Promise.all(post.images.map((image) => deleteFromCloudinary(image.imagePublicId)));
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/dashboard/postingan");
  revalidatePath("/postingan");
}

/**
 * Upload satu foto ke galeri kenangan.
 */
export async function uploadGalleryPhoto(_state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.status !== "APPROVED")) {
    throw new Error("Anda tidak memiliki akses ke halaman ini");
  }

  const parsed = uploadGallerySchema.safeParse({ caption: stringValue(formData, "caption") });
  if (!parsed.success) return { error: "Keterangan tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors };

  const file = readFile(formData, "image");
  if (!file) return { error: "Foto wajib dipilih." };

  const fileError = validateImageFile(file, 5);
  if (fileError) return { error: fileError };

  const uploaded = await uploadToCloudinary(await fileToBuffer(file), "gallery");
  await prisma.galleryPhoto.create({
    data: {
      uploadedById: session.user.id,
      imageUrl: uploaded.imageUrl,
      imagePublicId: uploaded.imagePublicId,
      caption: optional(parsed.data.caption ?? ""),
    },
  });

  revalidatePath("/galeri");
  if (session.user.role === "ADMIN") revalidatePath("/admin/galeri");
  redirect(session.user.role === "ADMIN" ? "/admin/galeri" : "/dashboard");
}

/**
 * Setujui registrasi alumni.
 */
export async function approveAlumni(userId: string) {
  const admin = await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { status: AccountStatus.APPROVED, rejectionReason: null },
  });
  await writeAdminLog(admin.id, "APPROVE_ALUMNI", "USER", userId, "Menyetujui registrasi alumni");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/alumni");
}

/**
 * Tolak registrasi alumni dengan alasan opsional.
 */
export async function rejectAlumni(
  stateOrFormData: ActionState | FormData = emptyState,
  maybeFormData?: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const formData = maybeFormData ?? (stateOrFormData as FormData);
  const userId = stringValue(formData, "userId");
  const reason = optional(stringValue(formData, "reason"));

  if (!userId) return { error: "Alumni tidak valid." };

  await prisma.user.update({
    where: { id: userId },
    data: { status: AccountStatus.REJECTED, rejectionReason: reason },
  });
  await writeAdminLog(admin.id, "REJECT_ALUMNI", "USER", userId, reason ?? "Menolak registrasi alumni");
  revalidatePath("/admin/verifikasi");
  revalidatePath("/admin/alumni");
  return { success: "Registrasi alumni ditolak." };
}

/**
 * Nonaktifkan atau aktifkan kembali akun alumni.
 */
export async function toggleAlumniStatus(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
  if (!user) throw new Error("Alumni tidak ditemukan.");

  const nextStatus = user.status === "DISABLED" ? "APPROVED" : "DISABLED";
  await prisma.user.update({ where: { id: userId }, data: { status: nextStatus } });
  await writeAdminLog(admin.id, "TOGGLE_ALUMNI_STATUS", "USER", userId, `Mengubah status alumni menjadi ${nextStatus}`);
  revalidatePath("/admin/alumni");
  revalidatePath(`/admin/alumni/${userId}`);
}

/**
 * Hapus akun alumni beserta asset terkait.
 */
export async function deleteAlumni(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      alumniProfile: true,
      posts: { include: { images: true } },
      galleryPhotos: true,
    },
  });

  if (!user || user.role !== "ALUMNI") throw new Error("Alumni tidak ditemukan.");

  const publicIds = [
    user.alumniProfile?.profilePhotoPublicId,
    ...user.posts.flatMap((post) => post.images.map((image) => image.imagePublicId)),
    ...user.galleryPhotos.map((photo) => photo.imagePublicId),
  ].filter((value): value is string => Boolean(value));

  await Promise.all(publicIds.map((publicId) => deleteFromCloudinary(publicId)));
  await prisma.user.delete({ where: { id: userId } });
  await writeAdminLog(admin.id, "DELETE_ALUMNI", "USER", userId, `Menghapus akun ${user.username}`);
  revalidatePath("/admin/alumni");
  redirect("/admin/alumni");
}

/**
 * Perbarui profil alumni dari panel admin.
 */
export async function adminUpdateAlumni(userId: string, _state: ActionState = emptyState, formData: FormData): Promise<ActionState> {
  void _state;
  const admin = await requireAdmin();
  const parsed = editProfileSchema.safeParse(profileDataFromForm(formData));

  if (!parsed.success) {
    return { error: "Periksa kembali data alumni.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.alumniProfile.update({
    where: { userId },
    data: {
      fullName: parsed.data.fullName,
      highSchoolMajor: parsed.data.highSchoolMajor as HighSchoolMajor,
      collegeMajor: parsed.data.collegeMajor,
      birthPlace: parsed.data.birthPlace,
      birthDate: new Date(parsed.data.birthDate),
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
    },
  });

  await writeAdminLog(admin.id, "UPDATE_ALUMNI", "USER", userId, "Memperbarui data alumni");
  revalidatePath(`/admin/alumni/${userId}`);
  revalidatePath("/admin/alumni");
  return { success: "Data alumni berhasil diperbarui." };
}

/**
 * Sembunyikan atau tampilkan postingan publik.
 */
export async function togglePostVisibility(postId: string) {
  const admin = await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { isHidden: true } });
  if (!post) throw new Error("Postingan tidak ditemukan.");

  await prisma.post.update({
    where: { id: postId },
    data: {
      isHidden: !post.isHidden,
      hiddenAt: post.isHidden ? null : new Date(),
      hiddenById: post.isHidden ? null : admin.id,
    },
  });
  await writeAdminLog(admin.id, post.isHidden ? "SHOW_POST" : "HIDE_POST", "POST", postId, "Mengubah visibilitas postingan");
  revalidatePath("/admin/postingan");
  revalidatePath("/postingan");
}

/**
 * Hapus postingan secara permanen dari panel admin.
 */
export async function adminDeletePost(postId: string) {
  const admin = await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { images: true } });
  if (!post) throw new Error("Postingan tidak ditemukan.");

  await Promise.all(post.images.map((image) => deleteFromCloudinary(image.imagePublicId)));
  await prisma.post.delete({ where: { id: postId } });
  await writeAdminLog(admin.id, "DELETE_POST", "POST", postId, "Menghapus postingan permanen");
  revalidatePath("/admin/postingan");
  revalidatePath("/postingan");
}

/**
 * Sembunyikan atau tampilkan foto galeri.
 */
export async function toggleGalleryVisibility(photoId: string) {
  const admin = await requireAdmin();
  const photo = await prisma.galleryPhoto.findUnique({ where: { id: photoId }, select: { isHidden: true } });
  if (!photo) throw new Error("Foto galeri tidak ditemukan.");

  await prisma.galleryPhoto.update({
    where: { id: photoId },
    data: {
      isHidden: !photo.isHidden,
      hiddenAt: photo.isHidden ? null : new Date(),
      hiddenById: photo.isHidden ? null : admin.id,
    },
  });
  await writeAdminLog(admin.id, photo.isHidden ? "SHOW_GALLERY" : "HIDE_GALLERY", "GALLERY", photoId, "Mengubah visibilitas foto galeri");
  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
}

/**
 * Hapus foto galeri secara permanen.
 */
export async function adminDeleteGalleryPhoto(photoId: string) {
  const admin = await requireAdmin();
  const photo = await prisma.galleryPhoto.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error("Foto galeri tidak ditemukan.");

  await deleteFromCloudinary(photo.imagePublicId);
  await prisma.galleryPhoto.delete({ where: { id: photoId } });
  await writeAdminLog(admin.id, "DELETE_GALLERY", "GALLERY", photoId, "Menghapus foto galeri permanen");
  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
}
