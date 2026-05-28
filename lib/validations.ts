import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter")
  .max(50, "Username maksimal 50 karakter")
  .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Za-z]/, "Password harus memuat huruf")
  .regex(/[0-9]/, "Password harus memuat angka");

const requiredText = (label: string, min = 2, max = 100) =>
  z
    .string()
    .trim()
    .min(min, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`);

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .optional()
    .or(z.literal(""));

const dateNotFuture = z
  .string()
  .min(1, "Tanggal lahir wajib diisi")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal lahir tidak valid")
  .refine((value) => new Date(value) <= new Date(), "Tanggal lahir tidak boleh di masa depan");

export const loginSchema = z.object({
  username,
  password: z.string().min(1, "Password wajib diisi"),
  remember: z.string().optional(),
});

export const registerSchema = z
  .object({
    fullName: requiredText("Nama lengkap", 2, 100),
    username,
    password,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    highSchoolMajor: z.enum(["IPA", "IPS"], { error: "Pilih jurusan SMA" }),
    collegeMajor: requiredText("Program studi kuliah", 2, 100),
    birthPlace: requiredText("Tempat lahir", 2, 100),
    birthDate: dateNotFuture,
    email: z.string().trim().email("Email tidak valid").optional().or(z.literal("")),
    phone: optionalText(20, "Nomor HP").refine(
      (value) => !value || /^(\+62|62|0)[0-9]{8,15}$/.test(value),
      "Nomor HP tidak valid",
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const editProfileSchema = z.object({
  fullName: requiredText("Nama lengkap", 2, 100),
  highSchoolMajor: z.enum(["IPA", "IPS"], { error: "Pilih jurusan SMA" }),
  collegeMajor: requiredText("Program studi kuliah", 2, 100),
  birthPlace: requiredText("Tempat lahir", 2, 100),
  birthDate: dateNotFuture,
  email: z.string().trim().email("Email tidak valid").optional().or(z.literal("")),
  phone: optionalText(20, "Nomor HP").refine(
    (value) => !value || /^(\+62|62|0)[0-9]{8,15}$/.test(value),
    "Nomor HP tidak valid",
  ),
  address: optionalText(500, "Alamat"),
  domicileCity: optionalText(100, "Kota domisili"),
  domicileProvince: optionalText(100, "Provinsi domisili"),
  originCity: optionalText(100, "Kota asal"),
  originProvince: optionalText(100, "Provinsi asal"),
  linkedinUrl: z.string().trim().url("URL LinkedIn tidak valid").optional().or(z.literal("")),
  portfolioUrl: z.string().trim().url("URL portofolio tidak valid").optional().or(z.literal("")),
  socialMedia: optionalText(1000, "Media sosial"),
  bio: optionalText(500, "Bio"),
});

export const createPostSchema = z.object({
  caption: requiredText("Caption", 1, 2000),
});

export const uploadGallerySchema = z.object({
  caption: optionalText(500, "Keterangan"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type ActionFieldErrors = Record<string, string[] | undefined>;
