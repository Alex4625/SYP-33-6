import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

import { getCloudflareDb } from "@/db";
import { alumniProfiles, users } from "@/db/schema";
import { registerSchema, type ActionFieldErrors } from "@/lib/validations";

export type RegistrationValues = {
  fullName: string;
  username: string;
  highSchoolMajor: string;
  collegeMajor: string;
  birthPlace: string;
  birthDate: string;
  email: string;
  phone: string;
};

export type RegistrationResult =
  | { ok: true; username: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: ActionFieldErrors;
      values: RegistrationValues;
    };

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function registrationValuesFromForm(formData: FormData): RegistrationValues {
  return {
    fullName: stringValue(formData, "fullName"),
    username: stringValue(formData, "username"),
    highSchoolMajor: stringValue(formData, "highSchoolMajor"),
    collegeMajor: stringValue(formData, "collegeMajor"),
    birthPlace: stringValue(formData, "birthPlace"),
    birthDate: stringValue(formData, "birthDate"),
    email: stringValue(formData, "email"),
    phone: stringValue(formData, "phone"),
  };
}

export async function createAlumniRegistration(formData: FormData): Promise<RegistrationResult> {
  const values = registrationValuesFromForm(formData);
  const parsed = registerSchema.safeParse({
    ...values,
    password: stringValue(formData, "password"),
    confirmPassword: stringValue(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Periksa kembali data registrasi.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  const db = await getCloudflareDb();
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, parsed.data.username))
    .limit(1);

  if (existingUser) {
    return {
      ok: false,
      error: "Username sudah digunakan, silakan pilih yang lain",
      fieldErrors: { username: ["Username sudah digunakan"] },
      values,
    };
  }

  const userId = crypto.randomUUID();
  const profileId = crypto.randomUUID();
  const passwordHash = await hash(parsed.data.password, 12);
  const createUser = db.insert(users).values({
    id: userId,
    username: parsed.data.username,
    passwordHash,
    role: "ALUMNI",
    status: "PENDING",
  });
  const createProfile = db.insert(alumniProfiles).values({
    id: profileId,
    userId,
    fullName: parsed.data.fullName,
    highSchoolMajor: parsed.data.highSchoolMajor,
    collegeMajor: parsed.data.collegeMajor,
    birthPlace: parsed.data.birthPlace,
    birthDate: parsed.data.birthDate,
    email: optional(parsed.data.email ?? ""),
    phone: optional(parsed.data.phone ?? ""),
  });

  try {
    await db.batch([createUser, createProfile]);
  } catch {
    return {
      ok: false,
      error: "Registrasi belum berhasil disimpan. Silakan coba lagi.",
      values,
    };
  }

  return { ok: true, username: parsed.data.username };
}
