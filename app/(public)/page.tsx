import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CameraIcon, ImageIcon, MapPinnedIcon, MessageSquareTextIcon, UsersRoundIcon } from "lucide-react";

import { AlumniCard } from "@/components/shared/AlumniCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { GalleryGrid } from "@/components/shared/GalleryGrid";
import { IndonesiaDistributionMap } from "@/components/shared/IndonesiaDistributionMap";
import { PostCard } from "@/components/shared/PostCard";
import { StatsCard } from "@/components/shared/StatsCard";
import { buttonVariants } from "@/components/ui/button";
import { getHomeData } from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beranda",
};

export default async function HomePage() {
  const {
    totalAlumni,
    totalPosts,
    totalGallery,
    latestAlumni,
    latestPosts,
    latestGallery,
    domicileDistribution,
  } = await getHomeData();

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
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/35" />
        <div className="container relative grid min-h-[620px] items-center gap-8 py-14 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-md border bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              Satu angkatan, tetap terhubung
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground md:text-6xl">
              Alumni SYP-33-6
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Tempat menemukan kembali teman sekolah, mengikuti perjalanan mereka di berbagai kota, dan merawat cerita yang tumbuh setelah kelulusan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/daftar" prefetch={false} className={cn(buttonVariants({ size: "lg" }), "h-11")}>
                Daftar Sekarang
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/alumni" prefetch={false} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}>
                Lihat Direktori
              </Link>
            </div>
          </div>
          <div className="rounded-lg border bg-background/78 p-5 shadow-sm backdrop-blur sm:p-6">
            <MapPinnedIcon className="size-7 text-primary" aria-hidden="true" />
            <p className="mt-8 text-sm font-medium text-primary">Jejak alumni</p>
            <h2 className="mt-2 max-w-md text-2xl font-semibold leading-8">
              Cerita sekolah yang terus bergerak ke berbagai penjuru Indonesia.
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-5">
              <div>
                <p className="text-2xl font-semibold">{totalAlumni}</p>
                <p className="mt-1 text-xs text-muted-foreground">Alumni aktif</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalPosts}</p>
                <p className="mt-1 text-xs text-muted-foreground">Cerita</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalGallery}</p>
                <p className="mt-1 text-xs text-muted-foreground">Kenangan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-sm font-medium text-primary">Komunitas digital</p>
            <h2 className="mt-2 text-3xl font-semibold">Ruang bersama yang terus bertumbuh.</h2>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
              Profil, kabar terbaru, dan foto kenangan tersimpan dalam satu tempat yang mudah dijelajahi.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard title="Alumni aktif" value={totalAlumni} icon={UsersRoundIcon} />
            <StatsCard title="Postingan publik" value={totalPosts} icon={MessageSquareTextIcon} />
            <StatsCard title="Foto galeri" value={totalGallery} icon={ImageIcon} />
          </div>
        </div>
      </section>

      <section className="section-band py-14">
        <div className="container">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-medium text-primary">Persebaran alumni</p>
            <h2 className="mt-2 text-3xl font-semibold">Dari sekolah yang sama, menuju kota yang berbeda.</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Peta domisili membantu melihat bagaimana jejaring SYP-33-6 bertumbuh di berbagai daerah.
            </p>
          </div>
          <IndonesiaDistributionMap locations={domicileDistribution} />
        </div>
      </section>

      <section className="container py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Potret kebersamaan</p>
            <h2 className="mt-2 text-3xl font-semibold">Galeri Kenangan</h2>
            <p className="mt-2 text-sm text-muted-foreground">Momen sekolah dan pertemuan alumni yang layak dikenang kembali.</p>
          </div>
          <Link href="/galeri" prefetch={false} className={cn(buttonVariants({ variant: "outline" }))}>
            Lihat galeri
            <CameraIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {latestGallery.length > 0 ? (
          <GalleryGrid photos={latestGallery} />
        ) : (
          <EmptyState title="Belum ada foto galeri" description="Foto kenangan akan tampil setelah alumni atau admin mengunggahnya." />
        )}
      </section>

      <section className="section-band py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Kenali kembali teman lama</p>
              <h2 className="mt-2 text-3xl font-semibold">Alumni Terbaru</h2>
              <p className="mt-2 text-sm text-muted-foreground">Profil alumni yang sudah diverifikasi admin.</p>
            </div>
            <Link href="/alumni" prefetch={false} className={cn(buttonVariants({ variant: "outline" }))}>Lihat semua</Link>
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

      <section className="container py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Cerita dari alumni</p>
            <h2 className="mt-2 text-3xl font-semibold">Postingan Terbaru</h2>
            <p className="mt-2 text-sm text-muted-foreground">Cerita dan kabar terbaru dari alumni.</p>
          </div>
          <Link href="/postingan" prefetch={false} className={cn(buttonVariants({ variant: "outline" }))}>Buka feed</Link>
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
