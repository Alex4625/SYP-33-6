import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ImageIcon, MessageSquareTextIcon, UsersRoundIcon } from "lucide-react";

import { AlumniCard } from "@/components/shared/AlumniCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PostCard } from "@/components/shared/PostCard";
import { StatsCard } from "@/components/shared/StatsCard";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Beranda",
};

export default async function HomePage() {
  const [totalAlumni, totalPosts, totalGallery, latestAlumni, latestPosts] = await Promise.all([
    prisma.user.count({ where: { role: "ALUMNI", status: "APPROVED" } }),
    prisma.post.count({ where: { isHidden: false } }),
    prisma.galleryPhoto.count({ where: { isHidden: false } }),
    prisma.alumniProfile.findMany({
      where: { user: { role: "ALUMNI", status: "APPROVED" } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        fullName: true,
        highSchoolMajor: true,
        collegeMajor: true,
        domicileCity: true,
        domicileProvince: true,
        profilePhotoUrl: true,
        user: { select: { username: true } },
      },
    }),
    prisma.post.findMany({
      where: { isHidden: false, author: { status: "APPROVED" } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        images: { orderBy: { orderIndex: "asc" } },
        author: {
          select: {
            username: true,
            alumniProfile: { select: { fullName: true, profilePhotoUrl: true } },
          },
        },
      },
    }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <Image
          src="/hero-alumni.png"
          alt="Reuni alumni SYP-33-6"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/25" />
        <div className="container relative grid min-h-[620px] items-center gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-md border bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              Direktori, postingan, dan galeri kenangan
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground md:text-6xl">
              Alumni SYP-33-6
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Ruang digital hangat untuk menemukan kembali teman sekolah, berbagi cerita, dan menjaga kenangan komunitas tetap rapi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/daftar" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
                Daftar Sekarang
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/alumni" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}>
                Lihat Direktori
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-background/70 p-4 shadow-sm backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square rounded-lg bg-brand-500/90 p-4 text-primary-foreground">
                <UsersRoundIcon className="size-7" aria-hidden="true" />
                <p className="mt-12 text-3xl font-semibold">{totalAlumni}</p>
                <p className="text-sm">Alumni aktif</p>
              </div>
              <div className="aspect-square rounded-lg bg-cedar-500 p-4 text-white">
                <MessageSquareTextIcon className="size-7" aria-hidden="true" />
                <p className="mt-12 text-3xl font-semibold">{totalPosts}</p>
                <p className="text-sm">Postingan</p>
              </div>
            </div>
            <div className="rounded-lg bg-card p-4">
              <ImageIcon className="size-6 text-primary" aria-hidden="true" />
              <p className="mt-4 text-2xl font-semibold">{totalGallery}</p>
              <p className="text-sm text-muted-foreground">Foto galeri kenangan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Alumni aktif" value={totalAlumni} icon={UsersRoundIcon} />
          <StatsCard title="Postingan publik" value={totalPosts} icon={MessageSquareTextIcon} />
          <StatsCard title="Foto galeri" value={totalGallery} icon={ImageIcon} />
        </div>
      </section>

      <section className="section-band py-12">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Alumni Terbaru</h2>
              <p className="text-sm text-muted-foreground">Profil alumni yang sudah diverifikasi admin.</p>
            </div>
            <Link href="/alumni" className={cn(buttonVariants({ variant: "outline" }))}>Lihat semua</Link>
          </div>
          {latestAlumni.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestAlumni.map((alumni) => <AlumniCard key={alumni.user.username} alumni={alumni} />)}
            </div>
          ) : (
            <EmptyState title="Belum ada alumni aktif" description="Data alumni akan muncul setelah admin menyetujui registrasi." />
          )}
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Postingan Terbaru</h2>
            <p className="text-sm text-muted-foreground">Cerita dan kenangan terbaru dari alumni.</p>
          </div>
          <Link href="/postingan" className={cn(buttonVariants({ variant: "outline" }))}>Buka feed</Link>
        </div>
        {latestPosts.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {latestPosts.map((post) => <PostCard key={post.id} post={post} compact />)}
          </div>
        ) : (
          <EmptyState title="Belum ada postingan" description="Postingan alumni akan tampil di sini setelah dibuat." />
        )}
      </section>
    </>
  );
}
