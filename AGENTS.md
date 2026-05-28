# AGENTS.md — Website Alumni SYP-33-6 (Cloudflare Stack)
# Instruksi Eksekusi untuk AI Coding Agent (Codex, Cursor Agent, dll.)

## ⚠️ BACA INI SEBELUM MENGERJAKAN APAPUN

Kamu adalah senior full-stack developer yang bertugas membangun Website Alumni SYP-33-6
secara penuh dari nol menggunakan **Cloudflare sebagai infrastruktur utama**.
Semua kebutuhan fungsional ada di file `PRD.md`. File ini mengatur cara teknis implementasinya.

**Aturan wajib:**
1. Baca `PRD.md` secara penuh sebelum menulis satu baris kode pun.
2. Kerjakan satu fase selesai sebelum pindah ke fase berikutnya.
3. Jangan hardcode credential — semua masuk ke file `.dev.vars` (lokal) dan Cloudflare dashboard (production).
4. Semua file menggunakan TypeScript strict mode, bukan JavaScript.
5. Semua teks UI menggunakan Bahasa Indonesia.
6. Gunakan Server Actions untuk mutasi data.
7. Setiap Server Action wajib validasi backend — jangan hanya validasi frontend.
8. Semua route harus menggunakan `export const runtime = 'edge'` karena Cloudflare Pages berjalan di Edge Runtime.

---

## TECH STACK YANG WAJIB DIGUNAKAN

```
Framework    : Next.js 14+ (App Router) + @cloudflare/next-on-pages
Bahasa       : TypeScript (strict mode)
Styling      : Tailwind CSS v3 + shadcn/ui (dikustomisasi, bukan default)
Database     : Cloudflare D1 (SQLite) — diakses via Drizzle ORM
Auth         : NextAuth.js v5 (Auth.js) — edge-compatible
File Storage : Cloudflare R2 (foto profil, postingan, galeri)
Email        : Resend (reset password) — satu-satunya layanan eksternal
Runtime      : Edge Runtime (BUKAN Node.js runtime)
Deploy       : Cloudflare Pages via GitHub integration
```

---

## PERBEDAAN PENTING DARI STACK STANDAR

| Aspek | Standar (Node.js) | Cloudflare (Edge) | Catatan |
|-------|-------------------|-------------------|---------|
| ORM | Prisma | **Drizzle ORM** | Prisma belum stabil di D1 |
| Database | MySQL | **SQLite (D1)** | Sintaks mirip, tapi tidak identik |
| Password hashing | bcrypt | **bcryptjs** | bcryptjs = pure JS, kompatibel edge |
| File Storage | Cloudinary | **Cloudflare R2** | Tidak ada transformasi otomatis |
| Env vars lokal | .env.local | **.dev.vars** | Format sama, nama file berbeda |
| Runtime | nodejs | **edge** | Wajib deklarasi di setiap route |

---

## STRUKTUR FOLDER PROJECT

```
syp-33-6/
├── app/
│   ├── (public)/           # Landing, direktori, galeri, feed, profil alumni
│   ├── (auth)/             # Login, register, lupa-password, reset-password
│   ├── (alumni)/           # Dashboard alumni — protected
│   └── (admin)/            # Dashboard admin — protected
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Komponen reusable custom
├── db/
│   ├── schema.ts           # Drizzle schema (semua tabel)
│   ├── index.ts            # Drizzle client untuk D1
│   └── migrations/         # File migrasi SQL yang di-generate Drizzle
├── lib/
│   ├── auth.ts             # NextAuth v5 config (edge-compatible)
│   ├── r2.ts               # Cloudflare R2 helper (upload & delete)
│   ├── resend.ts           # Email helper
│   ├── validations.ts      # Zod schemas semua form
│   └── utils.ts            # Helper functions
├── middleware.ts            # Route protection (edge middleware)
├── wrangler.toml            # Konfigurasi Cloudflare (D1 binding, R2 binding)
├── .dev.vars                # Environment variables lokal (jangan di-commit)
├── .dev.vars.example        # Template env vars untuk onboarding
└── PRD.md                   # Dokumen PRD lengkap
```

---

## URUTAN EKSEKUSI (WAJIB DIIKUTI BERURUTAN)

---

### FASE 0 — INSTALASI DEPENDENSI

#### 0.1 Inisialisasi project Next.js:
```bash
npx create-next-app@latest syp-33-6 \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd syp-33-6
```

#### 0.2 Install semua dependensi:
```bash
# Cloudflare adapter untuk Next.js
npm install @cloudflare/next-on-pages
npm install -D wrangler

# Database — Drizzle ORM + D1
npm install drizzle-orm
npm install -D drizzle-kit better-sqlite3 @types/better-sqlite3

# Auth
npm install next-auth@beta

# Password hashing — WAJIB pakai bcryptjs (bukan bcrypt) untuk edge runtime
npm install bcryptjs
npm install -D @types/bcryptjs

# R2 file storage — gunakan AWS SDK v3 (R2 kompatibel S3)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Email
npm install resend

# UI & Form
npm install zod react-dropzone
npm install yet-another-react-lightbox
npm install recharts

# Utility
npm install uuid
npm install -D @types/uuid

# shadcn/ui setup
npx shadcn@latest init
# Pilih: Default style, Zinc color, CSS variables: yes

# Install shadcn components
npx shadcn@latest add button card input label select textarea badge
npx shadcn@latest add dialog alert-dialog dropdown-menu separator
npx shadcn@latest add table skeleton toast avatar
npx shadcn@latest add navigation-menu sheet tabs
```

---

### FASE 1 — KONFIGURASI CLOUDFLARE

#### 1.1 Buat file `wrangler.toml` di root project:

```toml
name = "syp-33-6"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "syp336-db"
database_id = "AKAN_DIISI_SETELAH_BUAT_D1_DI_DASHBOARD"

[[r2_buckets]]
binding = "R2"
bucket_name = "syp336-storage"
```

#### 1.2 Buat file `.dev.vars` (lokal, jangan di-commit ke git):

```env
# NextAuth
NEXTAUTH_SECRET=generate-dengan-openssl-rand-base64-32-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2 (untuk akses via AWS SDK dari server)
R2_ACCOUNT_ID=cloudflare-account-id-kamu
R2_ACCESS_KEY_ID=r2-access-key
R2_SECRET_ACCESS_KEY=r2-secret-key
R2_BUCKET_NAME=syp336-storage
R2_PUBLIC_URL=https://pub-XXXXX.r2.dev

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_NAME=Alumni SYP-33-6
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 1.3 Buat file `.dev.vars.example` (di-commit ke git, tanpa nilai asli):

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
RESEND_API_KEY=
NEXT_PUBLIC_APP_NAME=Alumni SYP-33-6
NEXT_PUBLIC_APP_URL=
```

#### 1.4 Tambahkan ke `.gitignore`:
```
.dev.vars
.wrangler/
```

#### 1.5 Update `next.config.js` untuk Cloudflare Pages:

```javascript
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
}

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

export default nextConfig
```

#### 1.6 Tambahkan scripts di `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev",
    "deploy": "npm run pages:build && wrangler pages deploy",
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 execute syp336-db --local --file=",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

### FASE 2 — DATABASE SCHEMA (DRIZZLE + D1)

#### 2.1 Buat file `db/schema.ts`:

```typescript
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ENUM helpers (SQLite tidak punya ENUM, pakai text dengan validasi di app)
// Role: 'ADMIN' | 'ALUMNI'
// AccountStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED'
// HighSchoolMajor: 'IPA' | 'IPS'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['ADMIN', 'ALUMNI'] }).notNull().default('ALUMNI'),
  status: text('status', {
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'],
  }).notNull().default('PENDING'),
  rejectionReason: text('rejection_reason'),
  rememberToken: text('remember_token'),
  resetToken: text('reset_token'),
  resetTokenExpires: integer('reset_token_expires', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  statusIdx: index('users_status_idx').on(table.status),
}))

export const alumniProfiles = sqliteTable('alumni_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name', { length: 100 }).notNull(),
  highSchoolMajor: text('high_school_major', { enum: ['IPA', 'IPS'] }).notNull(),
  collegeMajor: text('college_major', { length: 100 }).notNull(),
  birthPlace: text('birth_place', { length: 100 }).notNull(),
  birthDate: text('birth_date').notNull(), // format: YYYY-MM-DD
  email: text('email', { length: 100 }),
  phone: text('phone', { length: 20 }),
  profilePhotoUrl: text('profile_photo_url'),
  profilePhotoKey: text('profile_photo_key'), // R2 object key untuk penghapusan
  address: text('address'),
  domicileCity: text('domicile_city', { length: 100 }),
  domicileProvince: text('domicile_province', { length: 100 }),
  originCity: text('origin_city', { length: 100 }),
  originProvince: text('origin_province', { length: 100 }),
  linkedinUrl: text('linkedin_url'),
  socialMedia: text('social_media'), // JSON string: [{platform, url}]
  portfolioUrl: text('portfolio_url'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  majorIdx: index('alumni_major_idx').on(table.highSchoolMajor),
  domicileIdx: index('alumni_domicile_idx').on(table.domicileProvince),
  originIdx: index('alumni_origin_idx').on(table.originProvince),
}))

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  caption: text('caption').notNull(),
  isHidden: integer('is_hidden', { mode: 'boolean' }).notNull().default(false),
  hiddenAt: integer('hidden_at', { mode: 'timestamp' }),
  hiddenById: text('hidden_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  hiddenIdx: index('posts_hidden_idx').on(table.isHidden),
  createdIdx: index('posts_created_idx').on(table.createdAt),
}))

export const postImages = sqliteTable('post_images', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),   // URL publik R2
  imageKey: text('image_key').notNull(),   // R2 object key untuk penghapusan
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const galleryPhotos = sqliteTable('gallery_photos', {
  id: text('id').primaryKey(),
  uploadedById: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),   // URL publik R2
  imageKey: text('image_key').notNull(),   // R2 object key untuk penghapusan
  caption: text('caption'),
  isHidden: integer('is_hidden', { mode: 'boolean' }).notNull().default(false),
  hiddenAt: integer('hidden_at', { mode: 'timestamp' }),
  hiddenById: text('hidden_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  hiddenIdx: index('gallery_hidden_idx').on(table.isHidden),
}))

export const adminLogs = sqliteTable('admin_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull().references(() => users.id),
  action: text('action', { length: 100 }).notNull(),
  targetType: text('target_type', { length: 50 }).notNull(),
  targetId: text('target_id'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  createdIdx: index('logs_created_idx').on(table.createdAt),
}))

// Type exports untuk digunakan di seluruh app
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type AlumniProfile = typeof alumniProfiles.$inferSelect
export type NewAlumniProfile = typeof alumniProfiles.$inferInsert
export type Post = typeof posts.$inferSelect
export type GalleryPhoto = typeof galleryPhotos.$inferSelect
export type AdminLog = typeof adminLogs.$inferSelect
```

#### 2.2 Buat file `db/index.ts` — Drizzle client untuk D1:

```typescript
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

// Fungsi ini dipanggil di setiap Server Action/Route dengan binding D1
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

// Type helper
export type Database = ReturnType<typeof getDb>
```

#### 2.3 Buat `db/migrations/0001_init.sql` — SQL migrasi awal:

Buat file SQL yang mencreate semua tabel sesuai schema di atas.
Jalankan untuk database lokal:
```bash
wrangler d1 execute syp336-db --local --file=db/migrations/0001_init.sql
```

#### 2.4 Buat `db/seed.ts` — Seed akun admin pertama:

```typescript
// Seed 1 akun admin:
// username: admin
// password: Admin@123456 (hash dengan bcryptjs, saltRounds: 12)
// role: ADMIN
// status: APPROVED
// Juga buat AlumniProfile kosong untuk admin agar relasi tidak error

// Jalankan dengan: npx tsx db/seed.ts
```

---

### FASE 3 — KONFIGURASI AUTH & HELPERS

#### 3.1 Buat `lib/auth.ts` — NextAuth v5 edge-compatible:

```typescript
// PENTING: Gunakan konfigurasi edge-compatible
// Jangan import library yang tidak kompatibel edge

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs' // bcryptjs bukan bcrypt

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Gunakan JWT strategy (edge-compatible, tidak butuh database adapter)
  session: { strategy: 'jwt' },
  
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        // Ambil D1 binding dari request context
        // Cari user berdasarkan username
        // Jika tidak ada: return null
        // Bandingkan password dengan bcryptjs compare
        // Jika tidak cocok: return null
        // Jika akun DISABLED: throw Error('DISABLED')
        // Return: { id, username, role, status }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.status = token.status as string
      session.user.username = token.username as string
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
```

#### 3.2 Buat `lib/r2.ts` — Cloudflare R2 helper:

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

// R2 kompatibel dengan AWS S3 API
// Endpoint format: https://<ACCOUNT_ID>.r2.cloudflarestorage.com

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

// Upload file ke R2
// Params: buffer (Buffer), key (string path di bucket), contentType (string)
// Returns: URL publik file
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client()
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

// Hapus file dari R2 berdasarkan key
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }))
}

// Generate key untuk file upload
// Format: folder/uuid.ext
// Contoh: profiles/abc-123.webp, posts/def-456.jpg
export function generateR2Key(folder: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  const uuid = crypto.randomUUID()
  return `${folder}/${uuid}.${ext}`
}
```

#### 3.3 Buat `lib/resend.ts` — Email helper:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  username: string
): Promise<void> {
  await resend.emails.send({
    from: 'Alumni SYP-33-6 <noreply@syp336.com>',
    to: email,
    subject: 'Reset Password Akun Alumni SYP-33-6',
    html: `
      <h2>Reset Password</h2>
      <p>Halo <strong>${username}</strong>,</p>
      <p>Kami menerima permintaan reset password untuk akun Anda.</p>
      <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
      <a href="${resetLink}" 
         style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
        Reset Password
      </a>
      <p>Link ini berlaku selama <strong>1 jam</strong>.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `,
  })
}
```

#### 3.4 Buat `lib/validations.ts` — Zod schemas:

```typescript
import { z } from 'zod'

// Semua pesan error dalam Bahasa Indonesia

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password harus mengandung huruf dan angka'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  highSchoolMajor: z.enum(['IPA', 'IPS'], { message: 'Pilih jurusan SMA' }),
  collegeMajor: z.string().min(2, 'Program studi minimal 2 karakter').max(100),
  birthPlace: z.string().min(2).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  username: z.string().min(1, 'Username tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
  rememberMe: z.boolean().optional(),
})

export const editProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  highSchoolMajor: z.enum(['IPA', 'IPS']),
  collegeMajor: z.string().min(2).max(100),
  birthPlace: z.string().min(2).max(100),
  birthDate: z.string(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  domicileCity: z.string().max(100).optional().or(z.literal('')),
  domicileProvince: z.string().max(100).optional().or(z.literal('')),
  originCity: z.string().max(100).optional().or(z.literal('')),
  originProvince: z.string().max(100).optional().or(z.literal('')),
  linkedinUrl: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().or(z.literal('')),
})

export const createPostSchema = z.object({
  caption: z.string()
    .min(1, 'Caption tidak boleh kosong')
    .max(2000, 'Caption maksimal 2000 karakter'),
})

export const uploadGallerySchema = z.object({
  caption: z.string().max(500).optional().or(z.literal('')),
})

// Validasi file upload (digunakan di server-side)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024    // 2 MB
const MAX_POST_PHOTO_SIZE = 5 * 1024 * 1024        // 5 MB

export function validateImageFile(
  file: File,
  maxSize: number = MAX_POST_PHOTO_SIZE
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.' }
  }
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024)
    return { valid: false, error: `Ukuran file melebihi batas ${maxMB}MB.` }
  }
  return { valid: true }
}

export { MAX_PROFILE_PHOTO_SIZE, MAX_POST_PHOTO_SIZE, ALLOWED_IMAGE_TYPES }
```

#### 3.5 Buat `middleware.ts` — Route protection dengan rate limiting:

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiting (per Cloudflare Worker instance)
// Untuk production lebih robust, gunakan Cloudflare KV
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const ip = req.headers.get('CF-Connecting-IP') ?? 
              req.headers.get('X-Forwarded-For') ?? 
              'unknown'

  // Rate limiting untuk endpoint auth
  if (pathname === '/daftar' || pathname === '/login') {
    if (req.method === 'POST') {
      const allowed = checkRateLimit(ip, 5, 10_000) // 5 request per 10 detik
      if (!allowed) {
        return NextResponse.json(
          { error: 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.' },
          { status: 429 }
        )
      }
    }
  }

  // Proteksi route admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) return NextResponse.redirect(new URL('/admin/login', req.url))
    if (session.user.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url))
  }

  // Proteksi route dashboard alumni
  if (pathname.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    if (session.user.role !== 'ALUMNI') return NextResponse.redirect(new URL('/', req.url))
    if (session.user.status === 'PENDING' || session.user.status === 'REJECTED') {
      return NextResponse.redirect(new URL('/status-akun', req.url))
    }
    if (session.user.status === 'DISABLED') {
      return NextResponse.redirect(new URL('/login?error=disabled', req.url))
    }
  }

  // Proteksi halaman status-akun
  if (pathname === '/status-akun') {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    if (session.user.status === 'APPROVED') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirect jika sudah login dan akses halaman auth
  if ((pathname === '/login' || pathname === '/daftar') && session) {
    if (session.user.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url))
    if (session.user.status === 'APPROVED') return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/status-akun',
    '/login',
    '/daftar',
  ],
}
```

---

### FASE 4 — LAYOUT & KOMPONEN GLOBAL

#### 4.1 Buat design tokens di `tailwind.config.ts`:

```typescript
// Definisikan palet warna kustom yang hangat dan profesional
// Contoh: gunakan warm gray (stone) sebagai base + amber sebagai aksen
// Tambahkan font: Geist Sans via next/font/google
// Definisikan border-radius kustom agar tidak terlihat default
// Tambahkan animasi subtle untuk komponen interaktif
```

#### 4.2 Buat `app/layout.tsx` — Root layout:

```typescript
// Tambahkan ThemeProvider dari 'next-themes' untuk dark mode
// npm install next-themes
// defaultTheme="system", attribute="class"
// Wrap semua children dengan ThemeProvider
// Tambahkan font dari next/font
// Tambahkan Toaster dari shadcn/ui untuk notifikasi
```

#### 4.3 Buat komponen di `components/shared/`:

Buat semua komponen berikut dengan implementasi lengkap dan fungsional:

- **`AlumniCard.tsx`**: Kartu alumni (foto/avatar, nama, badge jurusan IPA/IPS, prodi, kota domisili, tombol "Lihat Profil")
- **`PostCard.tsx`**: Kartu postingan (foto profil pembuat, nama, caption dengan truncate, foto carousel, tanggal relative)
- **`GalleryGrid.tsx`**: Grid foto dengan lightbox (gunakan yet-another-react-lightbox)
- **`StatsCard.tsx`**: Kartu statistik dengan ikon, nilai, label, dan warna aksen per kategori
- **`StatusBadge.tsx`**: Badge berwarna per status (pending=kuning, approved=hijau, rejected=merah, disabled=abu)
- **`FileUpload.tsx`**: Drag-and-drop upload dengan preview thumbnail, progress indicator, validasi
- **`DarkModeToggle.tsx`**: Toggle icon matahari/bulan menggunakan useTheme dari next-themes
- **`Navbar.tsx`**: Navbar responsif — desktop: link horizontal; mobile: hamburger → sheet drawer
- **`AdminSidebar.tsx`**: Sidebar dengan semua menu admin, badge jumlah pending, collapse di mobile
- **`FilterBar.tsx`**: Dropdown filter multi-kriteria untuk direktori alumni
- **`EmptyState.tsx`**: Ilustrasi + teks saat tidak ada data, dengan slot untuk action button
- **`ConfirmDialog.tsx`**: Dialog konfirmasi dengan slot title, description, variant (danger/warning)
- **`Pagination.tsx`**: Komponen pagination dengan prev/next dan nomor halaman

---

### FASE 5 — HALAMAN AUTENTIKASI

Buat semua halaman autentikasi dengan implementasi lengkap:

**`app/(auth)/login/page.tsx`**:
- Deklarasikan: `export const runtime = 'edge'`
- Form login: username + password + checkbox Ingat Saya
- Gunakan NextAuth `signIn` dengan Credentials
- Handling error: `DISABLED` → tampil pesan dinonaktifkan, credentials salah → tampil error
- Link ke /daftar dan /lupa-password

**`app/(auth)/daftar/page.tsx`**:
- Deklarasikan: `export const runtime = 'edge'`
- Form registrasi lengkap dengan validasi Zod real-time
- Server Action: validasi → hash password dengan bcryptjs → insert User + AlumniProfile dalam satu transaksi D1 → redirect

**`app/(auth)/lupa-password/page.tsx`** + **`app/(auth)/reset-password/[token]/page.tsx`**:
- Deklarasikan: `export const runtime = 'edge'`
- Implementasi lengkap sesuai Flow 3 di PRD

**`app/(alumni)/status-akun/page.tsx`**:
- Deklarasikan: `export const runtime = 'edge'`
- Tampilkan status pending atau rejected, tombol logout

---

### FASE 6 — HALAMAN PUBLIK

Semua file halaman publik wajib deklarasi: `export const runtime = 'edge'`

**`app/(public)/page.tsx`** — Landing Page:
- Hero section, statistik real-time dari D1, preview 6 alumni card, preview 3 post card, footer

**`app/(public)/alumni/page.tsx`** — Direktori Alumni:
- Query D1 dengan Drizzle + filter dinamis dari URL search params
- Card grid + filter bar + search + pagination 12 per halaman

**`app/(public)/alumni/[username]/page.tsx`** — Profil Publik:
- Tampilkan semua data kecuali email & phone
- Section postingan alumni di bawah

**`app/(public)/postingan/page.tsx`** — Feed Publik:
- PostCard list, pagination 10 per halaman

**`app/(public)/galeri/page.tsx`** — Galeri:
- GalleryGrid + lightbox, pagination 20 per halaman

---

### FASE 7 — DASHBOARD ALUMNI

Semua file wajib deklarasi: `export const runtime = 'edge'`

**`app/(alumni)/dashboard/page.tsx`**: Sambutan + quick links + preview postingan milik alumni

**`app/(alumni)/dashboard/profil/page.tsx`**: Form edit profil lengkap + upload foto profil ke R2

**`app/(alumni)/dashboard/postingan/page.tsx`**: Grid postingan + tombol hapus dengan konfirmasi

**`app/(alumni)/dashboard/postingan/baru/page.tsx`**: Form buat postingan + upload maks 4 foto ke R2

**`app/(alumni)/dashboard/galeri/upload/page.tsx`**: Form upload 1 foto ke galeri + caption opsional

---

### FASE 8 — DASHBOARD ADMIN

Semua file wajib deklarasi: `export const runtime = 'edge'`

**`app/(admin)/admin/login/page.tsx`**: Form login admin terpisah

**`app/(admin)/admin/page.tsx`** — Dashboard Admin:
- 4 StatsCard (fetch dari D1)
- 5 Recharts chart — WAJIB jadikan `'use client'` dan bungkus dengan `<Suspense>`
- Tabel 5 registrasi terbaru

**`app/(admin)/admin/verifikasi/page.tsx`**: Tabel pending + approve/reject dengan Server Actions

**`app/(admin)/admin/alumni/page.tsx`**: Tabel alumni + filter + search + pagination

**`app/(admin)/admin/alumni/[id]/page.tsx`**: Detail alumni LENGKAP termasuk email & phone + form edit + aksi

**`app/(admin)/admin/postingan/page.tsx`**: Tabel semua postingan + sembunyikan/hapus

**`app/(admin)/admin/galeri/page.tsx`**: Grid semua foto + overlay status + sembunyikan/hapus

**`app/(admin)/admin/log/page.tsx`**: Tabel AdminLog + filter tanggal

---

### FASE 9 — FINISHING

1. **Error pages**: `app/not-found.tsx` dan `app/error.tsx` dengan desain kustom

2. **Loading states**: Buat `loading.tsx` di setiap route group menggunakan Skeleton dari shadcn/ui

3. **SEO**: Tambahkan `generateMetadata` di setiap halaman, format: "[Nama Halaman] | Alumni SYP-33-6"

4. **Dark mode**: Pastikan semua komponen memiliki varian `dark:` Tailwind yang konsisten

5. **Optimasi gambar**: Semua gambar menggunakan `<Image>` dari next/image dengan domain R2 sudah dikonfigurasi di `next.config.js`

---

## CARA AKSES D1 DI SERVER ACTION

Karena D1 adalah Cloudflare binding, cara aksesnya berbeda dari database biasa:

```typescript
// Di Server Action atau Route Handler
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/db'

export async function someServerAction() {
  'use server'
  
  // Ambil D1 binding dari Cloudflare context
  const { env } = getRequestContext()
  const db = getDb(env.DB)
  
  // Gunakan Drizzle seperti biasa
  const alumni = await db.select().from(schema.users).where(...)
}
```

---

## CARA DEPLOY KE CLOUDFLARE PAGES

### Setup pertama (lakukan manual satu kali):

```bash
# 1. Login ke Cloudflare
npx wrangler login

# 2. Buat D1 database
npx wrangler d1 create syp336-db
# Copy database_id yang muncul ke wrangler.toml

# 3. Jalankan migrasi ke D1 production
npx wrangler d1 execute syp336-db --file=db/migrations/0001_init.sql

# 4. Jalankan seed admin ke D1 production
npx wrangler d1 execute syp336-db --file=db/migrations/0002_seed.sql

# 5. Buat R2 bucket
npx wrangler r2 bucket create syp336-storage

# 6. Set R2 bucket sebagai public (dari Cloudflare Dashboard)
# Dashboard → R2 → syp336-storage → Settings → Public Access → Allow Access
```

### Environment variables di Cloudflare Dashboard:
Buka: Cloudflare Dashboard → Pages → syp-33-6 → Settings → Environment variables

Tambahkan semua variable dari `.dev.vars`:
```
NEXTAUTH_SECRET    = [nilai rahasia panjang]
NEXTAUTH_URL       = https://syp336.pages.dev (atau domain kustom)
R2_ACCOUNT_ID      = [account ID Cloudflare]
R2_ACCESS_KEY_ID   = [R2 API token access key]
R2_SECRET_ACCESS_KEY = [R2 API token secret]
R2_BUCKET_NAME     = syp336-storage
R2_PUBLIC_URL      = https://pub-XXXXX.r2.dev
RESEND_API_KEY     = re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_NAME = Alumni SYP-33-6
NEXT_PUBLIC_APP_URL = https://syp336.pages.dev
```

### Deploy otomatis via GitHub:
```bash
# Push ke GitHub → Cloudflare Pages otomatis build & deploy
git add .
git commit -m "initial commit"
git push origin main

# Di Cloudflare Dashboard: Pages → Create Project → Connect GitHub → pilih repo
# Build command: npm run pages:build
# Build output: .vercel/output/static
```

---

## ATURAN KODE YANG TIDAK BOLEH DILANGGAR

```typescript
// ✅ WAJIB di setiap file route/page
export const runtime = 'edge'

// ✅ BENAR — Akses D1 binding
const { env } = getRequestContext()
const db = getDb(env.DB)

// ❌ SALAH — Prisma tidak kompatibel dengan D1/edge
import { prisma } from '@/lib/prisma'

// ✅ BENAR — bcryptjs untuk edge runtime
import { hash, compare } from 'bcryptjs'

// ❌ SALAH — bcrypt tidak kompatibel dengan edge
import bcrypt from 'bcrypt'

// ✅ BENAR — Data sensitif tidak pernah tampil publik
const profile = await db.select({
  fullName: alumniProfiles.fullName,
  domicileCity: alumniProfiles.domicileCity,
  // email tidak disertakan
}).from(alumniProfiles)

// ✅ BENAR — R2 key disimpan untuk keperluan penghapusan
const key = generateR2Key('profiles', file.name)
const url = await uploadToR2(buffer, key, file.type)
await db.update(alumniProfiles).set({
  profilePhotoUrl: url,
  profilePhotoKey: key, // simpan key untuk hapus nanti
})

// ✅ BENAR — Hapus file R2 saat ganti/hapus
if (existingProfile.profilePhotoKey) {
  await deleteFromR2(existingProfile.profilePhotoKey)
}
```

---

## CHECKLIST SEBELUM DIANGGAP SELESAI

### Setup & Konfigurasi
- [ ] `wrangler.toml` sudah diisi dengan database_id D1 yang benar
- [ ] `.dev.vars` sudah diisi semua nilai
- [ ] D1 database sudah dibuat dan migrasi berhasil
- [ ] Seed admin berhasil dijalankan
- [ ] R2 bucket sudah dibuat dan public access aktif
- [ ] `next.config.js` sudah dikonfigurasi untuk domain R2
- [ ] Semua halaman/route sudah deklarasi `export const runtime = 'edge'`

### Fungsionalitas
- [ ] Register alumni → status pending → halaman status akun tampil
- [ ] Admin approve → alumni bisa akses dashboard penuh
- [ ] Edit profil + upload foto profil ke R2 berfungsi
- [ ] Buat postingan (dengan/tanpa foto) → tampil di feed publik
- [ ] Upload galeri (alumni & admin) → tampil di halaman galeri dengan lightbox
- [ ] Admin dashboard: semua statistik & chart tampil dengan data real
- [ ] Admin bisa sembunyikan/hapus postingan & galeri
- [ ] Hapus postingan/galeri juga menghapus file dari R2
- [ ] Audit log mencatat semua aksi admin
- [ ] Reset password via email (Resend) berfungsi
- [ ] Direktori alumni: search & semua filter berfungsi
- [ ] Rate limiting aktif di endpoint /login dan /daftar

### UI/UX
- [ ] Semua halaman responsive di mobile, tablet, desktop
- [ ] Dark mode berfungsi dan toggle tersedia di navbar
- [ ] Loading skeleton aktif saat data sedang dimuat
- [ ] Halaman 404 dan 500 custom sudah dibuat
- [ ] Semua teks UI dalam Bahasa Indonesia
- [ ] Tidak ada tampilan default shadcn/ui yang tidak dikustomisasi

### Keamanan
- [ ] Semua route terproteksi sesuai role via middleware
- [ ] Email & phone tidak pernah muncul di response publik
- [ ] Password di-hash dengan bcryptjs (bukan bcrypt)
- [ ] File upload divalidasi format & ukuran di server-side
- [ ] R2 key disimpan di database untuk keperluan penghapusan
- [ ] File di R2 dihapus saat postingan/galeri/profil dihapus
