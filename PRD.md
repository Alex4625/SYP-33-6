# PRD — Website Alumni SYP-33-6
Versi: 1.0 | Tanggal: 28 Mei 2026 | Status: Draft

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Deskripsi Project
Website Alumni SYP-33-6 adalah platform web full-stack yang dibangun dari nol untuk komunitas alumni SMA bernama SYP-33-6. Platform ini menyediakan direktori alumni yang bisa dicari, fitur postingan/feed berbagi kenangan seperti feed sederhana ala Instagram, galeri foto kenangan masa SMA, serta dashboard admin untuk mengelola seluruh data dan konten. Website ini ditujukan untuk mempererat hubungan sesama alumni, menyimpan data alumni secara terpusat, dan menjadi ruang digital komunitas yang modern, hangat, dan profesional.

### 1.2 Masalah yang Diselesaikan
Komunitas alumni SYP-33-6 belum memiliki platform digital terpusat. Data alumni tersebar, tidak terstruktur, dan sulit dicari. Tidak ada ruang digital khusus untuk berbagi kenangan atau melihat perkembangan sesama alumni. Admin tidak memiliki alat untuk mengelola data dan konten komunitas secara efisien.

### 1.3 Solusi yang Ditawarkan
Platform web ini menyelesaikan masalah tersebut dengan menyediakan: sistem registrasi alumni dengan verifikasi admin, direktori alumni yang bisa difilter, fitur postingan/feed kenangan, galeri foto institusi, dan dashboard admin lengkap dengan statistik dan log aktivitas.

### 1.4 Target Pengguna
- **Admin**: Pengelola sistem, memiliki akses penuh ke semua data dan fitur
- **Alumni (Approved)**: Anggota komunitas yang sudah terverifikasi
- **Alumni (Pending/Rejected/Disabled)**: Alumni dengan akses terbatas sesuai status akun
- **Public Visitor**: Pengunjung umum tanpa akun, dapat melihat konten publik

### 1.5 Asumsi & Batasan

**Asumsi:**
- Skala pengguna: 100–500 alumni, sistem dirancang agar dapat berkembang
- Tidak ada angkatan/tahun lulus — data alumni tidak menggunakan field ini
- Satu akun admin utama, dibuat via database seed (bukan registrasi publik)
- Postingan alumni langsung tampil publik tanpa approval admin; admin dapat hapus/sembunyikan kapan saja
- Galeri kenangan dapat diupload oleh admin maupun alumni
- Foto pada postingan bersifat opsional; postingan dapat berupa teks/caption saja
- Profil publik alumni menampilkan semua data opsional kecuali email dan nomor HP
- Backup database dilakukan via fitur platform Railway (bukan sistem custom)
- Reset password menggunakan layanan email Resend (free tier)
- Dark mode diimplementasikan di sisi frontend (Tailwind CSS class-based, disimpan di localStorage)

**Batasan:**
- Tidak ada mobile app (Android/iOS)
- Tidak ada fitur job board, donasi, kartu alumni, forum besar, internal messaging
- Tidak ada role admin bertingkat
- Tidak ada integrasi dengan sistem eksternal (SIAKAD, ERP, dll.)
- Semua teknologi harus open-source dan gratis/free-tier
- Harus dapat di-deploy ke Vercel

---

## 2. TUJUAN & METRIK KEBERHASILAN

| Tujuan | Metrik | Target |
|--------|--------|--------|
| Alumni dapat mendaftar dan membuat profil | Jumlah alumni terdaftar | ≥ 50 alumni dalam 1 bulan pertama |
| Admin dapat mengelola data alumni dengan mudah | Waktu admin memverifikasi 1 akun | < 2 menit per akun |
| Data alumni tersimpan rapi dan mudah dicari | Waktu hasil pencarian muncul | < 1 detik |
| Alumni dapat berbagi kenangan | Jumlah postingan/foto diunggah | ≥ 20 postingan dalam 1 bulan pertama |
| Pengunjung dapat mengakses direktori | Halaman direktori dapat diakses tanpa login | 100% waktu |
| Tampilan profesional dan tidak generik | Tidak ada keluhan tampilan "AI-generated" dari pengguna | 0 keluhan |
| Sistem aman dari ancaman dasar | Tidak ada insiden keamanan dalam 6 bulan pertama | 0 insiden |

---

## 3. USER ROLES & PERMISSION

| Role | Deskripsi | Akses Utama |
|------|-----------|-------------|
| **Admin** | Pengelola sistem penuh, dibuat via seed | Dashboard admin, CRUD alumni, verifikasi akun, kelola postingan & galeri, lihat semua data termasuk privat, audit log, statistik lengkap |
| **Alumni (Approved)** | Alumni yang telah diverifikasi admin | Dashboard pribadi, edit profil, upload foto profil, buat postingan, upload ke galeri, lihat direktori alumni, lihat profil alumni lain |
| **Alumni (Pending)** | Alumni baru yang menunggu verifikasi | Login, lihat status "Menunggu Verifikasi Admin", tidak bisa akses fitur lain |
| **Alumni (Rejected)** | Alumni yang ditolak admin | Login, lihat status "Registrasi Ditolak", tidak bisa akses fitur lain |
| **Alumni (Disabled)** | Alumni yang dinonaktifkan admin | Tidak bisa login, tampil pesan "Akun Dinonaktifkan" |
| **Public Visitor** | Pengunjung tanpa akun | Landing page, direktori alumni, postingan publik, galeri, statistik dasar, form registrasi |

---

## 4. USER STORIES

### Modul: Autentikasi & Akun

- [ ] **US-001**: Sebagai public visitor, saya ingin mendaftar sebagai alumni, agar saya bisa bergabung dengan komunitas SYP-33-6.
  - Acceptance Criteria:
    - [ ] Form registrasi tersedia di halaman publik
    - [ ] Field wajib: nama lengkap, username, password, jurusan SMA, program studi kuliah, tempat lahir, tanggal lahir
    - [ ] Username unik; sistem menampilkan error jika sudah dipakai
    - [ ] Password minimal 8 karakter
    - [ ] Setelah submit, akun berstatus "pending"
    - [ ] Halaman sukses menampilkan pesan "Registrasi berhasil, menunggu verifikasi admin"

- [ ] **US-002**: Sebagai alumni, saya ingin login menggunakan username dan password, agar saya bisa mengakses platform.
  - Acceptance Criteria:
    - [ ] Form login menerima username + password
    - [ ] Jika akun pending: redirect ke halaman "Menunggu Verifikasi"
    - [ ] Jika akun rejected: tampil pesan "Registrasi Anda ditolak"
    - [ ] Jika akun disabled: tampil pesan "Akun Anda dinonaktifkan"
    - [ ] Jika approved: redirect ke dashboard alumni
    - [ ] Fitur "Ingat Saya" tersedia dan berfungsi

- [ ] **US-003**: Sebagai alumni, saya ingin mereset password via email, agar saya bisa masuk jika lupa password.
  - Acceptance Criteria:
    - [ ] Halaman "Lupa Password" menerima input email
    - [ ] Jika email terdaftar: kirim link reset (berlaku 1 jam)
    - [ ] Halaman reset meminta password baru + konfirmasi
    - [ ] Password baru berhasil disimpan dan user bisa login

- [ ] **US-004**: Sebagai admin, saya ingin login ke dashboard admin, agar saya bisa mengelola sistem.
  - Acceptance Criteria:
    - [ ] Form login admin terpisah atau dapat dibedakan dari login alumni
    - [ ] Admin berhasil login dan diarahkan ke dashboard admin
    - [ ] Halaman admin tidak bisa diakses tanpa login admin

### Modul: Profil Alumni

- [ ] **US-005**: Sebagai alumni approved, saya ingin mengelola profil saya, agar informasi saya selalu terkini.
  - Acceptance Criteria:
    - [ ] Halaman edit profil menampilkan semua field profil
    - [ ] Field wajib tidak bisa dikosongkan
    - [ ] Perubahan tersimpan dan tampil di profil publik
    - [ ] Alumni tidak bisa mengubah username setelah registrasi

- [ ] **US-006**: Sebagai alumni approved, saya ingin mengupload foto profil, agar profil saya lebih personal.
  - Acceptance Criteria:
    - [ ] Upload foto profil tersedia di halaman edit profil
    - [ ] Format yang diterima: JPG, JPEG, PNG, WEBP
    - [ ] Ukuran maksimal 2 MB; sistem menampilkan error jika melebihi
    - [ ] Foto disimpan ke Cloudinary dan URL tersimpan di database
    - [ ] Foto lama dihapus dari Cloudinary saat diganti

- [ ] **US-007**: Sebagai public visitor, saya ingin melihat profil alumni, agar saya bisa mengetahui informasi alumni tersebut.
  - Acceptance Criteria:
    - [ ] Halaman profil publik menampilkan: foto profil, nama lengkap, jurusan SMA, program studi kuliah, kota & provinsi domisili, kota & provinsi asal, LinkedIn, medsos lain, portofolio, bio singkat
    - [ ] Email dan nomor HP TIDAK ditampilkan di profil publik
    - [ ] Halaman profil dapat diakses tanpa login

### Modul: Direktori Alumni

- [ ] **US-008**: Sebagai public visitor, saya ingin melihat direktori alumni dalam format kartu, agar saya bisa mengetahui siapa saja anggota komunitas.
  - Acceptance Criteria:
    - [ ] Direktori menampilkan kartu alumni: foto, nama, jurusan SMA, program studi kuliah, kota domisili
    - [ ] Default: hanya alumni berstatus "approved" yang tampil
    - [ ] Pagination atau infinite scroll tersedia

- [ ] **US-009**: Sebagai public visitor, saya ingin mencari dan memfilter alumni, agar saya bisa menemukan alumni tertentu dengan cepat.
  - Acceptance Criteria:
    - [ ] Tersedia search bar untuk nama alumni
    - [ ] Filter tersedia: jurusan SMA (IPA/IPS), program studi kuliah, kota domisili, provinsi domisili, kota asal, provinsi asal
    - [ ] Hasil pencarian muncul secara real-time atau setelah submit
    - [ ] Jika tidak ada hasil: tampil pesan "Alumni tidak ditemukan"

### Modul: Postingan / Feed

- [ ] **US-010**: Sebagai alumni approved, saya ingin membuat postingan, agar saya bisa berbagi kenangan dengan sesama alumni.
  - Acceptance Criteria:
    - [ ] Form buat postingan memiliki: field caption/deskripsi (wajib), upload foto (opsional, maks 4 foto, maks 5 MB per foto)
    - [ ] Format foto: JPG, JPEG, PNG, WEBP
    - [ ] Postingan langsung tampil publik setelah disimpan
    - [ ] Postingan muncul di feed dengan nama dan foto profil pembuat

- [ ] **US-011**: Sebagai alumni approved, saya ingin melihat dan mengelola postingan saya, agar saya bisa menghapus postingan yang tidak ingin ditampilkan.
  - Acceptance Criteria:
    - [ ] Halaman "Postingan Saya" menampilkan semua postingan milik alumni tersebut
    - [ ] Alumni bisa menghapus postingan sendiri
    - [ ] Konfirmasi "Apakah Anda yakin ingin menghapus postingan ini?" muncul sebelum dihapus

- [ ] **US-012**: Sebagai public visitor, saya ingin melihat feed postingan alumni, agar saya bisa membaca kenangan yang dibagikan.
  - Acceptance Criteria:
    - [ ] Feed menampilkan postingan terbaru di urutan pertama
    - [ ] Setiap postingan menampilkan: foto profil pembuat, nama pembuat, caption, foto (jika ada), tanggal posting
    - [ ] Postingan yang disembunyikan admin tidak tampil di feed publik

- [ ] **US-013**: Sebagai admin, saya ingin menyembunyikan atau menghapus postingan, agar konten yang tidak sesuai tidak tampil di publik.
  - Acceptance Criteria:
    - [ ] Admin bisa sembunyikan postingan (tidak tampil di publik, tidak dihapus dari database)
    - [ ] Admin bisa hapus postingan permanen
    - [ ] Postingan yang disembunyikan masih tampil di panel admin dengan label "Disembunyikan"

### Modul: Galeri Kenangan

- [ ] **US-014**: Sebagai alumni approved atau admin, saya ingin mengupload foto ke galeri kenangan, agar kenangan SMA tersimpan secara kolektif.
  - Acceptance Criteria:
    - [ ] Form upload galeri: pilih/upload foto (maks 5 MB), tambahkan keterangan (caption opsional)
    - [ ] Format yang diterima: JPG, JPEG, PNG, WEBP
    - [ ] Foto tersimpan ke Cloudinary dan tampil di halaman galeri
    - [ ] Admin dan alumni approved dapat mengupload

- [ ] **US-015**: Sebagai public visitor, saya ingin melihat galeri kenangan, agar saya bisa menikmati foto-foto masa SMA komunitas ini.
  - Acceptance Criteria:
    - [ ] Halaman galeri menampilkan foto dalam grid
    - [ ] Klik foto membuka lightbox/preview lebih besar
    - [ ] Foto yang disembunyikan admin tidak tampil ke publik

- [ ] **US-016**: Sebagai admin, saya ingin mengelola galeri, agar foto yang tidak sesuai tidak tampil.
  - Acceptance Criteria:
    - [ ] Admin bisa sembunyikan atau hapus foto galeri
    - [ ] Hapus foto menghapus file dari Cloudinary dan record dari database

### Modul: Dashboard Admin

- [ ] **US-017**: Sebagai admin, saya ingin melihat statistik alumni di dashboard, agar saya bisa memantau perkembangan komunitas.
  - Acceptance Criteria:
    - [ ] Dashboard menampilkan statistik card: total alumni, alumni pending, alumni approved, alumni nonaktif
    - [ ] Chart alumni per jurusan SMA (pie chart)
    - [ ] Chart alumni per program studi (bar chart, top 10)
    - [ ] Chart alumni per provinsi domisili (bar chart)
    - [ ] Chart alumni per provinsi asal (bar chart)
    - [ ] Grafik registrasi per bulan (line chart)
    - [ ] Statistik postingan dan galeri (total postingan, total foto galeri)

- [ ] **US-018**: Sebagai admin, saya ingin mengelola data alumni, agar data komunitas selalu akurat.
  - Acceptance Criteria:
    - [ ] Halaman daftar alumni menampilkan tabel dengan: nama, username, jurusan, status akun, tanggal daftar
    - [ ] Admin bisa klik alumni untuk melihat detail lengkap termasuk email dan nomor HP
    - [ ] Admin bisa edit data alumni
    - [ ] Admin bisa hapus akun alumni (dengan konfirmasi)
    - [ ] Admin bisa nonaktifkan/aktifkan kembali akun alumni
    - [ ] Filter status: pending, approved, rejected, disabled

- [ ] **US-019**: Sebagai admin, saya ingin memverifikasi atau menolak registrasi alumni, agar hanya anggota komunitas nyata yang bergabung.
  - Acceptance Criteria:
    - [ ] Halaman "Verifikasi Alumni" menampilkan daftar alumni berstatus pending
    - [ ] Admin bisa approve: status berubah ke approved, alumni bisa akses penuh
    - [ ] Admin bisa reject: status berubah ke rejected, bisa isi alasan penolakan (opsional)
    - [ ] Notifikasi badge di sidebar admin jika ada alumni pending

- [ ] **US-020**: Sebagai admin, saya ingin melihat log aktivitas, agar saya bisa memantau semua aksi yang dilakukan di sistem.
  - Acceptance Criteria:
    - [ ] Setiap aksi admin tercatat: login, verifikasi alumni, hapus postingan, hapus galeri, edit data alumni
    - [ ] Log menampilkan: waktu, aksi, target (alumni/postingan/galeri yang terdampak)
    - [ ] Log dapat difilter berdasarkan tanggal

### Modul: Landing Page & Publik

- [ ] **US-021**: Sebagai public visitor, saya ingin melihat landing page yang menarik, agar saya mendapat kesan pertama yang baik tentang komunitas ini.
  - Acceptance Criteria:
    - [ ] Landing page memiliki: hero section dengan nama komunitas, deskripsi singkat, CTA "Daftar Sekarang" dan "Lihat Direktori"
    - [ ] Seksi statistik: jumlah alumni, jumlah postingan
    - [ ] Preview direktori alumni (6–9 kartu alumni)
    - [ ] Preview postingan terbaru (3–6 postingan)
    - [ ] Footer dengan link navigasi

---

## 5. FITUR & SCOPE

### 5.1 Fitur Wajib — MVP (Must Have)

| ID | Fitur | Deskripsi | Estimasi Kompleksitas |
|----|-------|-----------|----------------------|
| F-001 | Landing Page | Hero, statistik, preview direktori & feed, CTA registrasi | Rendah |
| F-002 | Registrasi Alumni | Form self-registration dengan status pending | Rendah |
| F-003 | Login Alumni | Login dengan username + password, Remember Me | Rendah |
| F-004 | Login Admin | Login admin ke dashboard terpisah | Rendah |
| F-005 | Lupa Password | Reset password via link email (Resend) | Sedang |
| F-006 | Status Akun | Pending, approved, rejected, disabled dengan halaman status | Rendah |
| F-007 | Dashboard Admin | Statistik card + charts (Recharts) | Sedang |
| F-008 | Manajemen Alumni | Tabel alumni, filter, detail, edit, hapus, nonaktifkan | Sedang |
| F-009 | Verifikasi Alumni | Approve/reject akun pending | Rendah |
| F-010 | Profil Alumni | Halaman profil publik dengan semua data non-sensitif | Rendah |
| F-011 | Edit Profil | Form edit profil dengan validasi | Rendah |
| F-012 | Upload Foto Profil | Upload ke Cloudinary, maks 2 MB | Sedang |
| F-013 | Direktori Alumni | Card grid + search + filter multi-kriteria | Sedang |
| F-014 | Buat Postingan | Form caption + upload foto opsional (maks 4 foto) | Sedang |
| F-015 | Feed Postingan | Tampilkan semua postingan publik secara kronologis | Rendah |
| F-016 | Kelola Postingan (Alumni) | Lihat & hapus postingan sendiri | Rendah |
| F-017 | Kelola Postingan (Admin) | Sembunyikan / hapus postingan dari panel admin | Rendah |
| F-018 | Upload Galeri | Upload foto ke galeri kenangan (admin & alumni) | Sedang |
| F-019 | Halaman Galeri | Grid foto dengan lightbox preview | Sedang |
| F-020 | Kelola Galeri (Admin) | Sembunyikan / hapus foto galeri | Rendah |
| F-021 | Audit Log | Catat dan tampilkan log aktivitas admin | Sedang |
| F-022 | Dark Mode | Toggle dark/light mode, disimpan di localStorage | Rendah |
| F-023 | Responsive Design | Mobile-first, tampil baik di HP, tablet, desktop | Sedang |
| F-024 | Keamanan Dasar | CSRF, XSS, input sanitasi, password bcrypt, rate limiting | Sedang |

### 5.2 Fitur Diinginkan — Fase 2 (Should Have)

| ID | Fitur | Deskripsi | Estimasi Kompleksitas |
|----|-------|-----------|----------------------|
| F-101 | Like Postingan | Alumni bisa like postingan | Rendah |
| F-102 | Komentar Postingan | Alumni bisa komentar pada postingan | Sedang |
| F-103 | Export Data Alumni | Ekspor data ke Excel/CSV | Sedang |
| F-104 | Import Data Alumni | Import massal data alumni dari Excel | Tinggi |
| F-105 | Email Broadcast | Admin kirim email ke semua alumni | Tinggi |

### 5.3 Fitur Opsional — Fase 3 (Nice to Have)

| ID | Fitur | Deskripsi | Estimasi Kompleksitas |
|----|-------|-----------|----------------------|
| F-201 | Peta Persebaran Alumni | Visualisasi peta interaktif | Tinggi |
| F-202 | Notifikasi In-App | Notifikasi saat akun diverifikasi | Sedang |
| F-203 | Event Alumni | Pengumuman & RSVP event | Tinggi |
| F-204 | Advanced Analytics | Analitik mendalam dengan filter rentang tanggal | Tinggi |

### 5.4 Di Luar Scope — Out of Scope

- Mobile app Android/iOS
- Job board / lowongan kerja
- Donasi / payment
- Sertifikat atau kartu alumni digital
- Forum diskusi besar
- Internal messaging antar alumni
- Fitur pertemanan/koneksi seperti media sosial penuh
- Role admin bertingkat
- Berita/artikel formal
- Integrasi dengan sistem eksternal (SIAKAD, ERP)
- REST API khusus untuk konsumsi mobile
- Two-Factor Authentication (2FA)
- CAPTCHA

---

## 6. ARSITEKTUR SISTEM

### 6.1 Gambaran Umum Arsitektur

Arsitektur **Full-Stack Monolith dengan Next.js App Router**. Frontend dan backend berada dalam satu codebase Next.js. API Routes / Server Actions digunakan untuk logika server-side. Tidak ada API terpisah karena tidak ada kebutuhan mobile app.

```
Browser (Client)
      │
      ▼
  Vercel CDN
      │
      ▼
Next.js App (Vercel)
  ├── App Router (Pages & Layouts)
  ├── Server Components (Fetch data server-side)
  ├── Server Actions / API Routes (Mutasi data)
  └── NextAuth.js (Autentikasi)
      │
      ├──▶ Railway MySQL (via Prisma ORM)
      └──▶ Cloudinary (File Storage)
            └──▶ Resend (Email Service)
```

### 6.2 Technology Stack

| Layer | Teknologi | Versi | Alasan Pemilihan |
|-------|-----------|-------|-----------------|
| **Framework** | Next.js | 14+ (App Router) | Full-stack, SSR/SSG, optimal untuk Vercel, populer di AI coding |
| **Bahasa** | TypeScript | 5+ | Type safety, lebih mudah di-maintain oleh AI coding |
| **Styling** | Tailwind CSS | 3+ | Utility-first, dark mode built-in, mobile-first |
| **Komponen UI** | shadcn/ui | Latest | Komponen accessible & customizable, tidak terlihat generik |
| **Database** | MySQL | 8+ | Sesuai permintaan, relasional |
| **Database Host** | Railway | Free tier | Kompatibel dengan Vercel, MySQL support, free tier cukup untuk skala ini |
| **ORM** | Prisma | 5+ | Type-safe, auto-generate client, migrasi mudah |
| **Auth** | NextAuth.js (Auth.js) | v5 | Official Next.js auth, credentials provider support |
| **File Storage** | Cloudinary | Free tier | 25 GB storage gratis, SDK lengkap, transformasi gambar otomatis |
| **Email** | Resend | Free tier | 100 email/hari gratis, API simple, cocok untuk reset password |
| **Charts** | Recharts | Latest | Open-source, ringan, kompatibel dengan React/Next.js |
| **Deployment** | Vercel | Free tier | Native Next.js deployment, CI/CD otomatis |
| **CI/CD** | GitHub + Vercel | — | Auto-deploy saat push ke branch main |

### 6.3 Integrasi Eksternal

| Sistem | Tujuan | Protokol |
|--------|--------|----------|
| Cloudinary | Upload dan penyimpanan foto profil, foto postingan, foto galeri | REST API / SDK |
| Resend | Pengiriman email reset password | REST API |
| Railway | Hosting database MySQL | TCP/SSL (Prisma connection string) |

---

## 7. DESAIN DATABASE

### 7.1 Entity Relationship (Deskriptif)

- **User** adalah entitas utama. Setiap user memiliki satu **AlumniProfile** yang menyimpan data pribadi dan kontak.
- Setiap **User** (alumni approved) dapat membuat banyak **Post**.
- Setiap **Post** dapat memiliki banyak **PostImage**.
- Setiap **User** (alumni approved) atau **User** (admin) dapat mengupload banyak **GalleryPhoto**.
- **Admin** adalah User dengan role ADMIN.
- **AdminLog** mencatat setiap aksi yang dilakukan User dengan role ADMIN.

### 7.2 Skema Tabel

#### Tabel: `users`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | VARCHAR(36) | PK, NOT NULL | UUID v4 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Nama akun unik, tidak bisa diubah |
| password_hash | VARCHAR(255) | NOT NULL | Hash bcrypt |
| role | ENUM('ADMIN','ALUMNI') | NOT NULL, DEFAULT 'ALUMNI' | Role pengguna |
| status | ENUM('PENDING','APPROVED','REJECTED','DISABLED') | NOT NULL, DEFAULT 'PENDING' | Status akun |
| rejection_reason | TEXT | NULLABLE | Alasan penolakan oleh admin |
| remember_token | VARCHAR(255) | NULLABLE | Token untuk fitur "Ingat Saya" |
| reset_token | VARCHAR(255) | NULLABLE | Token reset password |
| reset_token_expires | DATETIME | NULLABLE | Waktu kadaluarsa token reset |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | Waktu registrasi |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | Waktu update terakhir |

#### Tabel: `alumni_profiles`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | VARCHAR(36) | PK, NOT NULL | UUID v4 |
| user_id | VARCHAR(36) | FK → users.id, UNIQUE, NOT NULL | Relasi ke tabel users |
| full_name | VARCHAR(100) | NOT NULL | Nama lengkap |
| high_school_major | ENUM('IPA','IPS') | NOT NULL | Jurusan SMA |
| college_major | VARCHAR(100) | NOT NULL | Program studi kuliah |
| birth_place | VARCHAR(100) | NOT NULL | Tempat lahir |
| birth_date | DATE | NOT NULL | Tanggal lahir |
| email | VARCHAR(100) | NULLABLE | Email (hanya terlihat admin) |
| phone | VARCHAR(20) | NULLABLE | Nomor HP (hanya terlihat admin) |
| profile_photo_url | TEXT | NULLABLE | URL foto profil di Cloudinary |
| profile_photo_public_id | VARCHAR(255) | NULLABLE | Public ID Cloudinary untuk penghapusan |
| address | TEXT | NULLABLE | Alamat lengkap |
| domicile_city | VARCHAR(100) | NULLABLE | Kota domisili |
| domicile_province | VARCHAR(100) | NULLABLE | Provinsi domisili |
| origin_city | VARCHAR(100) | NULLABLE | Kota asal |
| origin_province | VARCHAR(100) | NULLABLE | Provinsi asal |
| linkedin_url | TEXT | NULLABLE | URL profil LinkedIn |
| social_media | JSON | NULLABLE | Medsos lain (format: [{platform, url}]) |
| portfolio_url | TEXT | NULLABLE | URL portofolio |
| bio | TEXT | NULLABLE | Bio singkat, maks 500 karakter |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | — |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | — |

#### Tabel: `posts`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | VARCHAR(36) | PK, NOT NULL | UUID v4 |
| user_id | VARCHAR(36) | FK → users.id, NOT NULL | Pembuat postingan |
| caption | TEXT | NOT NULL | Isi postingan/caption |
| is_hidden | BOOLEAN | NOT NULL, DEFAULT FALSE | Disembunyikan oleh admin |
| hidden_at | DATETIME | NULLABLE | Waktu disembunyikan |
| hidden_by | VARCHAR(36) | FK → users.id, NULLABLE | Admin yang menyembunyikan |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | — |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | — |

#### Tabel: `post_images`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | VARCHAR(36) | PK, NOT NULL | UUID v4 |
| post_id | VARCHAR(36) | FK → posts.id, NOT NULL | Postingan terkait |
| image_url | TEXT | NOT NULL | URL gambar di Cloudinary |
| image_public_id | VARCHAR(255) | NOT NULL | Public ID Cloudinary untuk penghapusan |
| order_index | INT | NOT NULL, DEFAULT 0 | Urutan gambar dalam postingan |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | — |

#### Tabel: `gallery_photos`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | VARCHAR(36) | PK, NOT NULL | UUID v4 |
| uploaded_by | VARCHAR(36) | FK → users.id, NOT NULL | Pengunggah (admin atau alumni) |
| image_url | TEXT | NOT NULL | URL gambar di Cloudinary |
| image_public_id | VARCHAR(255) | NOT NULL | Public ID Cloudinary |
| caption | TEXT | NULLABLE | Keterangan foto |
| is_hidden | BOOLEAN | NOT NULL, DEFAULT FALSE | Disembunyikan oleh admin |
| hidden_at | DATETIME | NULLABLE | — |
| hidden_by | VARCHAR(36) | FK → users.id, NULLABLE | — |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | — |

#### Tabel: `admin_logs`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | VARCHAR(36) | PK, NOT NULL | UUID v4 |
| admin_id | VARCHAR(36) | FK → users.id, NOT NULL | Admin yang melakukan aksi |
| action | VARCHAR(100) | NOT NULL | Jenis aksi (contoh: APPROVE_ALUMNI, DELETE_POST) |
| target_type | VARCHAR(50) | NOT NULL | Tipe target (USER, POST, GALLERY) |
| target_id | VARCHAR(36) | NULLABLE | ID target yang terdampak |
| description | TEXT | NULLABLE | Deskripsi detail aksi |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | Waktu aksi |

---

## 8. ALUR SISTEM (USER FLOW)

### Flow 1: Registrasi & Verifikasi Alumni
```
[Public Visitor] Klik "Daftar"
      │
      ▼
Isi form registrasi (data wajib + opsional)
      │
      ▼
Validasi frontend (field wajib, format, panjang) ──► Error? Tampilkan pesan error
      │
      ▼
Submit ke server → Validasi backend
      │
      ▼
Buat user (status: PENDING) + AlumniProfile
      │
      ▼
Redirect ke halaman "Menunggu Verifikasi Admin"
      │
      ▼
[Admin] Melihat notifikasi alumni pending di dashboard
      │
      ├── Approve ──► Status: APPROVED ──► Alumni bisa akses penuh
      └── Reject  ──► Status: REJECTED ──► Alumni lihat halaman ditolak
```

### Flow 2: Login Alumni
```
[User] Buka halaman login, isi username + password
      │
      ▼
Validasi backend: cek username & password (bcrypt compare)
      │
      ├── Tidak cocok ──► Tampil error "Username atau password salah"
      │
      └── Cocok → Cek status akun
            ├── PENDING  ──► Redirect ke halaman "Menunggu Verifikasi"
            ├── REJECTED ──► Tampil pesan "Registrasi ditolak"
            ├── DISABLED ──► Tampil pesan "Akun dinonaktifkan"
            └── APPROVED ──► Buat session → Redirect ke dashboard alumni
```

### Flow 3: Reset Password
```
[User] Klik "Lupa Password" → Isi email
      │
      ▼
Cek email di database
      ├── Tidak ada ──► Tampil pesan generik "Jika email terdaftar, link akan dikirim"
      │                 (hindari enumeration attack)
      └── Ada ──► Generate token reset (UUID, expire 1 jam)
                  Simpan token & waktu kadaluarsa di tabel users
                  Kirim email via Resend dengan link reset
                        │
                        ▼
                  [User] Klik link di email → Halaman reset password
                        │
                        ├── Token expired ──► Tampil error "Link sudah kadaluarsa"
                        └── Token valid  ──► Isi password baru → Simpan hash → Hapus token
```

### Flow 4: Buat Postingan
```
[Alumni Approved] Klik "Buat Postingan"
      │
      ▼
Isi caption (wajib) + upload foto opsional (maks 4 foto)
      │
      ▼
Validasi: caption tidak kosong, format & ukuran foto valid
      │
      ▼
Upload foto ke Cloudinary (jika ada) → Dapatkan URL & public_id
      │
      ▼
Simpan Post + PostImages ke database
      │
      ▼
Post langsung tampil di feed publik
      │
      (Kapan saja) Admin bisa sembunyikan/hapus postingan
```

### Flow 5: Upload Galeri
```
[Alumni Approved / Admin] Buka halaman galeri → Klik "Upload Foto"
      │
      ▼
Pilih foto (maks 5 MB, format JPG/JPEG/PNG/WEBP)
      │
      ▼
Isi caption (opsional) → Submit
      │
      ▼
Upload ke Cloudinary → Simpan GalleryPhoto ke database
      │
      ▼
Foto tampil di halaman galeri publik
      │
      (Kapan saja) Admin bisa sembunyikan/hapus foto
```

### Flow 6: Admin Mengelola Alumni
```
[Admin] Dashboard → Menu "Manajemen Alumni"
      │
      ▼
Pilih filter status (pending/approved/rejected/disabled)
      │
      ▼
Klik alumni → Lihat detail (termasuk email & nomor HP)
      │
      ├── Edit data ──► Simpan perubahan → Catat di admin_logs
      ├── Approve   ──► Status: APPROVED → Catat di admin_logs
      ├── Reject    ──► Isi alasan → Status: REJECTED → Catat di admin_logs
      ├── Disable   ──► Status: DISABLED → Catat di admin_logs
      └── Hapus     ──► Konfirmasi → Hapus user & profile → Catat di admin_logs
```

---

## 9. DESAIN UI/UX

### 9.1 Halaman / Screen yang Dibutuhkan

| ID | Nama Halaman | Path / Route | Akses Role |
|----|-------------|--------------|------------|
| P-001 | Landing Page | `/` | Public |
| P-002 | Direktori Alumni | `/alumni` | Public |
| P-003 | Profil Alumni | `/alumni/[username]` | Public |
| P-004 | Feed Postingan | `/postingan` | Public |
| P-005 | Galeri Kenangan | `/galeri` | Public |
| P-006 | Halaman Login | `/login` | Public |
| P-007 | Halaman Registrasi | `/daftar` | Public |
| P-008 | Halaman Lupa Password | `/lupa-password` | Public |
| P-009 | Halaman Reset Password | `/reset-password/[token]` | Public |
| P-010 | Halaman Status Akun | `/status-akun` | Alumni (Pending/Rejected) |
| P-011 | Dashboard Alumni | `/dashboard` | Alumni Approved |
| P-012 | Edit Profil | `/dashboard/profil` | Alumni Approved |
| P-013 | Postingan Saya | `/dashboard/postingan` | Alumni Approved |
| P-014 | Buat Postingan | `/dashboard/postingan/baru` | Alumni Approved |
| P-015 | Upload Galeri | `/dashboard/galeri/upload` | Alumni Approved |
| P-016 | Dashboard Admin | `/admin` | Admin |
| P-017 | Manajemen Alumni | `/admin/alumni` | Admin |
| P-018 | Detail Alumni (Admin) | `/admin/alumni/[id]` | Admin |
| P-019 | Verifikasi Alumni | `/admin/verifikasi` | Admin |
| P-020 | Kelola Postingan (Admin) | `/admin/postingan` | Admin |
| P-021 | Kelola Galeri (Admin) | `/admin/galeri` | Admin |
| P-022 | Audit Log | `/admin/log` | Admin |
| P-023 | Login Admin | `/admin/login` | Public |

### 9.2 Komponen UI Utama (Reusable Components)

- `AlumniCard` — Kartu alumni untuk direktori (foto, nama, jurusan, prodi, domisili)
- `PostCard` — Kartu postingan (foto profil, nama, caption, foto postingan, tanggal)
- `GalleryGrid` — Grid foto galeri dengan lightbox
- `StatsCard` — Kartu statistik untuk dashboard admin
- `StatusBadge` — Badge status akun (pending/approved/rejected/disabled)
- `FileUpload` — Komponen drag-and-drop upload dengan preview
- `DarkModeToggle` — Toggle gelap/terang di navbar
- `Navbar` — Navigasi utama responsif dengan hamburger menu di mobile
- `FilterBar` — Komponen filter untuk direktori alumni
- `Pagination` — Komponen pagination untuk direktori dan tabel admin
- `ConfirmDialog` — Dialog konfirmasi untuk aksi destruktif (hapus, nonaktifkan)
- `EmptyState` — Tampilan saat tidak ada data/hasil pencarian

### 9.3 Prinsip Desain

- **Mobile-first**: Desain dimulai dari tampilan HP (320px–480px) lalu dikembangkan ke tablet dan desktop
- **Minimalis & hangat**: Hindari elemen berlebihan; gunakan whitespace secukupnya; warna netral dengan aksen hangat
- **Konsisten**: Gunakan design token Tailwind CSS secara konsisten (warna, spacing, radius, shadow)
- **Dark mode**: Semua komponen harus memiliki varian dark mode via kelas Tailwind `dark:`
- **Accessible**: Kontras warna memenuhi WCAG AA, label form tersedia, keyboard-navigable
- **Tidak generik**: Hindari tampilan "default shadcn/ui" mentah; kustomisasi warna, border-radius, dan spacing agar unik
- **Bahasa Indonesia**: Semua teks UI, pesan error, label form menggunakan Bahasa Indonesia

---

## 10. KEAMANAN & VALIDASI

### 10.1 Autentikasi & Otorisasi

- **Autentikasi**: NextAuth.js v5 dengan Credentials Provider (username + password)
- **Password**: Di-hash menggunakan `bcrypt` dengan salt rounds minimal 12
- **Session**: JWT session (stateless) disimpan di cookie HttpOnly; expire 7 hari, diperbarui saat aktif
- **Remember Me**: Jika aktif, session expire diperpanjang ke 30 hari
- **Route Protection**: Middleware Next.js mengecek session dan role sebelum mengizinkan akses ke route terproteksi
- **RBAC**: Setiap Server Action dan API Route memvalidasi role user yang sedang login sebelum eksekusi
- **Admin Route**: Semua route `/admin/*` hanya bisa diakses user dengan `role: ADMIN`

### 10.2 Validasi Input

| Entitas | Field | Aturan Validasi |
|---------|-------|----------------|
| **Registrasi** | username | 3–50 karakter, hanya huruf/angka/underscore, unik |
| | password | Minimal 8 karakter, mengandung huruf & angka |
| | full_name | 2–100 karakter, tidak boleh hanya spasi |
| | high_school_major | Harus nilai ENUM: IPA atau IPS |
| | college_major | 2–100 karakter |
| | birth_date | Format tanggal valid, tidak di masa depan |
| **Profil** | email | Format email valid jika diisi |
| | phone | Format nomor valid (contoh: 08xx atau +62xx) jika diisi |
| | bio | Maksimal 500 karakter |
| | linkedin_url, portfolio_url | Format URL valid jika diisi |
| **Postingan** | caption | Minimal 1 karakter, maksimal 2000 karakter |
| **Upload File** | Semua file | Hanya JPG/JPEG/PNG/WEBP; foto profil maks 2 MB; foto postingan & galeri maks 5 MB |

### 10.3 Keamanan Data & Sistem

- **CSRF Protection**: NextAuth.js dan Next.js Server Actions memiliki proteksi CSRF built-in
- **XSS Prevention**: Sanitasi semua input teks sebelum disimpan; React secara default melakukan escaping output
- **SQL Injection**: Prisma ORM menggunakan parameterized queries secara default
- **Rate Limiting**: Implementasi rate limiting di route registrasi (maks 5 request/IP/menit) dan login (maks 10 request/IP/menit) menggunakan middleware
- **File Upload Security**: Validasi MIME type dan ukuran di sisi server sebelum upload ke Cloudinary; jangan percaya validasi client-side saja
- **Sensitive Data**: Email dan nomor HP tidak pernah dikembalikan di API response publik; hanya tersedia di endpoint yang dilindungi role ADMIN
- **Environment Variables**: Semua credential (DB connection string, Cloudinary API key, NextAuth secret, Resend API key) disimpan di `.env.local` dan Vercel Environment Variables, tidak pernah di-hardcode

---

## 11. PERFORMA & SKALABILITAS

| Aspek | Requirement |
|-------|-------------|
| Waktu loading halaman pertama | < 3 detik pada koneksi 4G |
| Waktu loading direktori alumni (100+ alumni) | < 2 detik |
| Concurrent users | 100 concurrent users |
| Ukuran foto profil maksimal | 2 MB |
| Ukuran foto postingan/galeri maksimal | 5 MB per file |
| Maks foto per postingan | 4 foto |
| Ketersediaan sistem | 99% uptime (Vercel SLA) |
| Optimasi gambar | Cloudinary otomatis optimasi & transformasi; gunakan Next.js `<Image>` component |
| Database query | Semua query menggunakan index pada kolom yang sering di-filter (status, high_school_major, domicile_province) |

---

## 12. PENANGANAN ERROR

| Skenario Error | Pesan yang Ditampilkan | Aksi Sistem |
|----------------|------------------------|-------------|
| Username sudah dipakai saat registrasi | "Username sudah digunakan, silakan pilih yang lain" | Highlight field username |
| Password tidak sesuai saat login | "Username atau password salah" | Tidak memberikan info spesifik field mana yang salah |
| Akun pending saat login | "Akun Anda sedang menunggu verifikasi admin" | Redirect ke halaman status |
| Akun rejected saat login | "Registrasi Anda telah ditolak" | Tampilkan alasan jika ada |
| Akun disabled saat login | "Akun Anda telah dinonaktifkan" | Tidak bisa login |
| Token reset password kadaluarsa | "Link reset password sudah kadaluarsa. Silakan minta link baru." | Tawarkan link ke halaman lupa password |
| File terlalu besar | "Ukuran file melebihi batas [2MB/5MB]. Pilih file yang lebih kecil." | Blokir upload, highlight field |
| Format file tidak didukung | "Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP." | Blokir upload |
| Akses halaman tanpa izin | "Anda tidak memiliki akses ke halaman ini" | Redirect ke halaman login atau 403 |
| Data tidak ditemukan (404) | "Halaman tidak ditemukan" | Tampilkan halaman 404 kustom |
| Error server (500) | "Terjadi kesalahan. Silakan coba lagi." | Log error di server, tampilkan pesan generik |
| Rate limit terlampaui | "Terlalu banyak percobaan. Silakan tunggu beberapa saat." | Blokir request sementara |

---

## 13. PRIORITAS & FASE PENGERJAAN

### Fase 1 — MVP (Minggu 1–4)
Setup project & konfigurasi awal:
- [ ] Inisialisasi Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- [ ] Setup Prisma + koneksi Railway MySQL
- [ ] Setup NextAuth.js v5 (credentials provider)
- [ ] Setup Cloudinary SDK
- [ ] Setup Resend untuk email
- [ ] Buat schema Prisma lengkap + migrasi awal
- [ ] Seed admin pertama ke database

Fitur inti:
- [ ] Landing page (F-001)
- [ ] Halaman registrasi alumni (F-002)
- [ ] Halaman login alumni + admin (F-003, F-004)
- [ ] Lupa/reset password (F-005)
- [ ] Penanganan status akun (F-006)
- [ ] Dashboard admin + statistik + charts (F-007)
- [ ] Manajemen alumni CRUD (F-008)
- [ ] Verifikasi alumni (F-009)
- [ ] Halaman profil publik alumni (F-010)
- [ ] Edit profil + upload foto profil (F-011, F-012)
- [ ] Direktori alumni + search + filter (F-013)
- [ ] Buat postingan + upload foto (F-014)
- [ ] Feed postingan publik (F-015)
- [ ] Kelola postingan alumni & admin (F-016, F-017)
- [ ] Upload galeri + halaman galeri + lightbox (F-018, F-019)
- [ ] Kelola galeri admin (F-020)
- [ ] Audit log admin (F-021)
- [ ] Dark mode toggle (F-022)
- [ ] Responsive design semua halaman (F-023)
- [ ] Keamanan dasar: validasi, hashing, rate limiting (F-024)

### Fase 2 — Pengembangan (Minggu 5–8)
- [ ] Fitur like postingan (F-101)
- [ ] Fitur komentar postingan (F-102)
- [ ] Export data alumni ke Excel/CSV (F-103)
- [ ] Notifikasi in-app saat akun diverifikasi (F-202)

### Fase 3 — Penyempurnaan (Minggu 9–12)
- [ ] Import massal data alumni dari Excel (F-104)
- [ ] Email broadcast ke alumni (F-105)
- [ ] Peta persebaran alumni interaktif (F-201)
- [ ] Advanced analytics dengan filter tanggal (F-204)
- [ ] Optimasi performa & audit keamanan

---

## 14. RISIKO PROJECT

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Railway MySQL free tier mencapai batas storage | Sedang | Sedang | Monitor usage; upgrade ke paid tier ($5/bln) jika perlu; rutin hapus data tidak perlu |
| Cloudinary free tier mencapai batas bandwidth | Sedang | Sedang | Aktifkan transformasi otomatis (resize, compress) di Cloudinary; monitor usage |
| AI coding menghasilkan kode tidak konsisten | Tinggi | Sedang | PRD ini sangat detail; gunakan prompt per modul yang spesifik; review kode secara manual |
| Tampilan akhir terlihat generik | Sedang | Tinggi | Kustomisasi shadcn/ui secara eksplisit di prompt implementasi; definisikan design token custom |
| Vercel cold start memperlambat response | Rendah | Rendah | Gunakan SSG untuk halaman statis; ISR untuk direktori alumni |
| Spam registrasi akun | Rendah | Sedang | Rate limiting di endpoint registrasi; semua akun harus diverifikasi manual admin |
| Data alumni bocor ke publik | Rendah | Tinggi | Validasi role di setiap Server Action; tidak pernah return data sensitif di response publik |

---

## 15. PROMPT IMPLEMENTASI UNTUK AI CODING

### Prompt Setup Awal
```
Kamu adalah senior full-stack developer yang membangun Website Alumni SYP-33-6.

Tech stack:
- Framework: Next.js 14+ dengan App Router dan TypeScript
- Styling: Tailwind CSS v3 + shadcn/ui (kustomisasi, jangan pakai default mentah)
- Database: MySQL via Railway, diakses dengan Prisma ORM v5
- Auth: NextAuth.js v5 (Auth.js) dengan Credentials Provider
- File storage: Cloudinary (foto profil, foto postingan, foto galeri)
- Email: Resend (hanya untuk reset password)
- Charts: Recharts
- Deployment: Vercel

Struktur folder:
syp-33-6/
├── app/
│   ├── (public)/          # Landing, direktori, galeri, feed, profil alumni
│   ├── (auth)/            # Login, register, lupa-password, reset-password
│   ├── (alumni)/          # Dashboard alumni (protected, role: ALUMNI, status: APPROVED)
│   ├── (admin)/           # Dashboard admin (protected, role: ADMIN)
│   └── api/               # API routes jika diperlukan
├── components/
│   ├── ui/                # shadcn/ui components
│   └── shared/            # Komponen reusable custom
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth config
│   ├── cloudinary.ts      # Cloudinary helper
│   ├── resend.ts          # Resend email helper
│   └── utils.ts           # Helper functions umum
├── prisma/
│   └── schema.prisma      # Skema database lengkap
├── middleware.ts           # Route protection + rate limiting
└── .env.local             # Semua environment variables

Konvensi kode:
- Selalu gunakan TypeScript strict mode
- Gunakan Server Actions untuk mutasi data, bukan API Routes biasa
- Semua fungsi harus ada JSDoc comment singkat
- Gunakan environment variable untuk semua credential sensitif
- Bahasa UI: Bahasa Indonesia
- Wajib validasi input di server-side, jangan hanya frontend
- Semua password di-hash dengan bcrypt, salt rounds: 12
- Jangan pernah return data sensitif (email, phone) di endpoint publik
```

---

### Prompt Modul 1: Setup & Konfigurasi Awal
```
Buat konfigurasi awal project Website Alumni SYP-33-6 dengan spesifikasi:

1. PRISMA SCHEMA — Buat file prisma/schema.prisma dengan model berikut:
   - User: id(uuid), username, password_hash, role(ADMIN|ALUMNI), 
     status(PENDING|APPROVED|REJECTED|DISABLED), rejection_reason, 
     remember_token, reset_token, reset_token_expires, created_at, updated_at
   - AlumniProfile: id(uuid), user_id(FK), full_name, high_school_major(IPA|IPS), 
     college_major, birth_place, birth_date, email, phone, profile_photo_url, 
     profile_photo_public_id, address, domicile_city, domicile_province, 
     origin_city, origin_province, linkedin_url, social_media(JSON), 
     portfolio_url, bio, created_at, updated_at
   - Post: id(uuid), user_id(FK), caption, is_hidden, hidden_at, hidden_by(FK), created_at, updated_at
   - PostImage: id(uuid), post_id(FK), image_url, image_public_id, order_index, created_at
   - GalleryPhoto: id(uuid), uploaded_by(FK), image_url, image_public_id, caption, 
     is_hidden, hidden_at, hidden_by(FK), created_at
   - AdminLog: id(uuid), admin_id(FK), action, target_type, target_id, description, created_at
   Tambahkan index pada: users.status, alumni_profiles.high_school_major, 
   alumni_profiles.domicile_province, alumni_profiles.origin_province

2. NEXTAUTH CONFIG — Buat lib/auth.ts:
   - Credentials provider dengan username + password
   - Validasi: cek username di DB, bcrypt compare password, cek status akun
   - JWT session dengan user id, role, dan status
   - Callback untuk menyertakan role dan status di session token

3. MIDDLEWARE — Buat middleware.ts:
   - Proteksi route /admin/* → hanya role ADMIN
   - Proteksi route /dashboard/* → hanya role ALUMNI dengan status APPROVED
   - Route /status-akun → hanya alumni dengan status PENDING atau REJECTED
   - Redirect user yang sudah login dari /login ke dashboard yang sesuai

4. DATABASE SEED — Buat prisma/seed.ts:
   - Buat 1 akun admin: username "admin", password "Admin@123456" (hash dengan bcrypt)
   - Role: ADMIN, Status: APPROVED

5. ENVIRONMENT VARIABLES — Buat .env.local.example dengan semua key yang dibutuhkan:
   DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, CLOUDINARY_CLOUD_NAME, 
   CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, RESEND_API_KEY
```

---

### Prompt Modul 2: Autentikasi (Login, Register, Reset Password)
```
Buat modul Autentikasi untuk Website Alumni SYP-33-6:

HALAMAN REGISTRASI (/daftar):
- Form dengan field wajib: nama lengkap, username, password, konfirmasi password, 
  jurusan SMA (dropdown: IPA/IPS), program studi kuliah, tempat lahir, tanggal lahir
- Field opsional bisa ditambahkan setelah verifikasi (di edit profil)
- Validasi frontend: semua field wajib diisi, password min 8 karakter (huruf+angka),
  konfirmasi password harus sama, username 3-50 karakter (hanya huruf/angka/underscore)
- Server Action: validasi backend, cek username unik, hash password, buat User + AlumniProfile
- Setelah sukses: redirect ke /status-akun dengan query param ?status=pending

HALAMAN LOGIN (/login):
- Form: username + password + checkbox "Ingat Saya"
- Server Action via NextAuth signIn
- Handling error per status: pending → /status-akun, rejected → /status-akun?status=rejected,
  disabled → /login?error=disabled, approved → /dashboard
- Tampilkan pesan error yang sesuai per kondisi

HALAMAN STATUS AKUN (/status-akun):
- Tampilkan status akun user yang sedang login (pending/rejected)
- Pending: ilustrasi menunggu + teks "Registrasi Anda sedang ditinjau admin"
- Rejected: teks "Registrasi ditolak" + tampilkan rejection_reason jika ada
- Tombol logout tersedia

HALAMAN LUPA PASSWORD (/lupa-password) & RESET PASSWORD (/reset-password/[token]):
- Form lupa password: input email
- Server Action: cari user by email di alumni_profiles, generate UUID token, 
  simpan ke users.reset_token & reset_token_expires (1 jam), kirim email via Resend
- Email berisi link: https://[domain]/reset-password/[token]
- Form reset password: input password baru + konfirmasi
- Server Action: validasi token belum expired, hash password baru, simpan, hapus token
- Respon email selalu "Jika email terdaftar, link akan dikirim" (hindari enumeration)

Rate limiting di semua endpoint auth: gunakan header X-Forwarded-For + in-memory Map 
(atau upstash/redis jika tersedia) untuk batasi request per IP.
```

---

### Prompt Modul 3: Direktori Alumni & Profil Publik
```
Buat modul Direktori Alumni dan Profil Publik:

HALAMAN DIREKTORI (/alumni):
- Fetch alumni dengan status APPROVED dari database (Server Component)
- Tampilkan dalam card grid: 3 kolom desktop, 2 kolom tablet, 1 kolom mobile
- AlumniCard menampilkan: foto profil (atau avatar placeholder), nama lengkap, 
  jurusan SMA (badge IPA/IPS), program studi, kota domisili, tombol "Lihat Profil"
- Search bar: cari berdasarkan nama (query ke database, bukan filter frontend)
- Filter sidebar/dropdown: jurusan SMA, program studi (autocomplete), kota domisili,
  provinsi domisili, kota asal, provinsi asal
- Pagination: 12 alumni per halaman
- URL params menyimpan state pencarian (?q=nama&jurusan=IPA&halaman=2)
- State kosong: tampilkan EmptyState dengan teks "Tidak ada alumni ditemukan"

HALAMAN PROFIL ALUMNI (/alumni/[username]):
- Tampilkan: foto profil besar, nama lengkap, jurusan SMA, program studi kuliah,
  tempat & tanggal lahir, kota & provinsi domisili, kota & provinsi asal,
  bio singkat, LinkedIn (link ke profil), media sosial lain, portofolio (link)
- JANGAN tampilkan: email, nomor HP
- Jika alumni belum mengisi field opsional: jangan tampilkan section tersebut
- Di bawah profil: tampilkan postingan yang dibuat alumni tersebut (publik, tidak hidden)
- Jika alumni tidak ditemukan atau status bukan APPROVED: tampilkan 404

OPTIMASI:
- Gunakan Next.js generateStaticParams untuk pre-generate halaman profil populer
- Gunakan Next.js Image component untuk semua foto
- Cache direktori alumni dengan revalidate 60 detik
```

---

### Prompt Modul 4: Postingan / Feed
```
Buat modul Postingan / Feed Website Alumni SYP-33-6:

HALAMAN FEED PUBLIK (/postingan):
- Tampilkan semua postingan yang is_hidden = false, diurutkan terbaru
- PostCard: foto profil + nama pembuat (link ke profil), tanggal post,
  caption (truncate di 300 karakter + "Baca selengkapnya"),
  foto postingan (jika ada): carousel jika lebih dari 1 foto
- Pagination: 10 postingan per halaman
- Foto post menggunakan Next.js Image + Cloudinary URL transformasi

HALAMAN BUAT POSTINGAN (/dashboard/postingan/baru) — Protected: Alumni Approved:
- Form: textarea caption (wajib, maks 2000 karakter), upload foto (opsional)
- Komponen upload foto: drag-and-drop, preview thumbnail, maks 4 foto, 
  maks 5 MB per foto, format JPG/JPEG/PNG/WEBP
- Validasi client + server side
- Server Action:
  1. Validasi input
  2. Upload tiap foto ke Cloudinary folder "posts/" 
  3. Simpan Post + PostImages ke database
  4. Redirect ke /dashboard/postingan
- Error handling: jika Cloudinary gagal, rollback simpanan foto yang sudah terupload

HALAMAN POSTINGAN SAYA (/dashboard/postingan) — Protected: Alumni Approved:
- Grid postingan milik alumni yang sedang login
- Setiap item: thumbnail foto pertama (atau ikon teks jika tidak ada foto), 
  preview caption, tanggal, tombol hapus
- Hapus: Server Action — hapus PostImages dari Cloudinary, hapus records dari DB
- Konfirmasi sebelum hapus

KELOLA POSTINGAN ADMIN (/admin/postingan) — Protected: Admin:
- Tabel semua postingan: kolom = pembuat, preview caption, jumlah foto, 
  status (publik/tersembunyi), tanggal
- Filter: status (semua/publik/tersembunyi), search nama pembuat
- Aksi per baris: Sembunyikan (toggle is_hidden) / Hapus Permanen
- Sembunyikan: update is_hidden=true, hidden_at, hidden_by; catat AdminLog
- Hapus: hapus foto dari Cloudinary, hapus PostImages, hapus Post; catat AdminLog
```

---

### Prompt Modul 5: Dashboard Admin & Statistik
```
Buat Dashboard Admin Website Alumni SYP-33-6:

LAYOUT ADMIN:
- Sidebar navigasi: Dashboard, Verifikasi Alumni (badge jumlah pending), 
  Manajemen Alumni, Kelola Postingan, Kelola Galeri, Audit Log
- Header: nama admin, tombol logout
- Responsive: sidebar collapse jadi hamburger menu di mobile

HALAMAN DASHBOARD ADMIN (/admin):
Statistik Cards (row 4 kartu):
- Total Alumni Terdaftar (semua status)
- Alumni Pending (dengan warna kuning/amber)
- Alumni Aktif/Approved (dengan warna hijau)
- Alumni Nonaktif/Disabled (dengan warna merah)

Charts (gunakan Recharts):
1. Pie Chart: distribusi alumni per Jurusan SMA (IPA vs IPS)
2. Bar Chart horizontal: top 10 program studi kuliah
3. Bar Chart: distribusi alumni per provinsi domisili (top 10)
4. Bar Chart: distribusi alumni per provinsi asal (top 10)
5. Line Chart: jumlah registrasi per bulan (12 bulan terakhir)

Statistik tambahan:
- Total postingan (publik vs tersembunyi)
- Total foto galeri (publik vs tersembunyi)
- Tabel "Alumni Baru" (5 registrasi terbaru): nama, username, tanggal daftar

Semua data di-fetch server-side dengan Prisma aggregations.
Recharts harus di-render sebagai Client Component (karena membutuhkan browser).
Wrap di <Suspense> dengan loading skeleton.

HALAMAN VERIFIKASI ALUMNI (/admin/verifikasi):
- Tabel alumni berstatus PENDING: nama, username, jurusan, prodi, tanggal daftar, aksi
- Aksi: Approve (Server Action → status APPROVED + catat AdminLog) 
       Reject (modal → isi alasan → Server Action → status REJECTED + catat AdminLog)
- Setelah approve/reject: revalidate halaman, update badge di sidebar

HALAMAN MANAJEMEN ALUMNI (/admin/alumni):
- Tabel semua alumni dengan filter status + search nama/username
- Kolom: foto profil (thumbnail), nama, username, jurusan, prodi, status (badge), tanggal daftar, aksi
- Aksi per baris: Lihat Detail, Edit, Nonaktifkan/Aktifkan, Hapus
- Halaman detail alumni: tampilkan SEMUA data termasuk email & nomor HP
- Form edit: semua field profil bisa diedit admin
- Setiap aksi dicatat ke AdminLog
```

---

### Prompt Modul 6: Galeri Kenangan
```
Buat modul Galeri Kenangan Website Alumni SYP-33-6:

HALAMAN GALERI PUBLIK (/galeri):
- Grid masonry atau grid uniform: 3-4 kolom desktop, 2 kolom tablet, 1-2 kolom mobile
- Tampilkan foto yang is_hidden = false, diurutkan terbaru
- Hover foto: tampilkan caption (jika ada) dan nama pengunggah
- Klik foto: buka lightbox full-screen dengan navigasi prev/next
- Pagination: load 20 foto per halaman

UPLOAD GALERI (alumni: /dashboard/galeri/upload, admin: /admin/galeri/upload):
- Form: upload satu foto, input caption (opsional)
- Format: JPG/JPEG/PNG/WEBP, maks 5 MB
- Preview foto sebelum submit
- Server Action: validasi → upload ke Cloudinary folder "gallery/" → simpan GalleryPhoto

KELOLA GALERI ADMIN (/admin/galeri):
- Grid semua foto galeri dengan overlay status (publik/tersembunyi)
- Filter: semua/publik/tersembunyi, search nama pengunggah
- Aksi per foto: Sembunyikan/Tampilkan (toggle), Hapus Permanen
- Hapus: hapus dari Cloudinary + hapus record + catat AdminLog

LIGHTBOX COMPONENT:
- Gunakan portal React agar render di atas semua konten
- Navigasi keyboard: arrow kiri/kanan untuk next/prev, Escape untuk tutup
- Tampilkan: foto full size, caption, nama pengunggah, tanggal upload
- Backdrop click untuk tutup
```

---

## CHECKLIST KUALITAS PRD

### Kelengkapan
- [x] Semua 15 bagian PRD telah diisi
- [x] Tidak ada bagian yang kosong tanpa penjelasan
- [x] Asumsi telah ditulis secara eksplisit di bagian 1.5

### Kejelasan
- [x] Setiap fitur memiliki deskripsi yang cukup untuk dikerjakan tanpa pertanyaan lanjutan
- [x] Acceptance criteria dapat diuji (testable)
- [x] Tidak ada terminologi ambigu

### Teknis
- [x] Skema database mencakup semua entitas yang disebutkan di user stories
- [x] Semua route/halaman sudah didefinisikan di bagian 9.1
- [x] Integrasi eksternal (Cloudinary, Resend, Railway) sudah diidentifikasi

### Siap Eksekusi
- [x] Prompt implementasi tersedia untuk 6 modul utama
- [x] Fase pengerjaan realistis dengan estimasi minggu
- [x] Risiko utama sudah diidentifikasi dan ada rencana mitigasi
