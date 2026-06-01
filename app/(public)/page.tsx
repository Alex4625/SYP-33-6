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
      <section className="relative overflow-hidden border-b border-black dark:border-border">
        <Image
          src="/hero-alumni.png"
          alt="Reuni alumni SYP-33-6"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="container relative flex min-h-[620px] items-end py-8 sm:py-12">
          <div className="grid w-full gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="border border-white bg-black p-5 text-white sm:p-7">
            <p className="catalog-bevel mb-5 inline-flex border border-black bg-accent px-3 py-1 font-sans text-xs font-bold uppercase text-black">
              Satu angkatan, tetap terhubung
            </p>
            <h1 className="font-display text-4xl uppercase leading-none tracking-normal md:text-6xl">
              Alumni <span className="whitespace-nowrap">SYP-33-6</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-white">
              Tempat menemukan kembali teman sekolah, mengikuti perjalanan mereka di berbagai kota, dan merawat cerita yang tumbuh setelah kelulusan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/daftar" prefetch={false} className={cn(buttonVariants({ size: "lg" }), "catalog-bevel h-11 border-black bg-accent text-black hover:bg-accent/80")}>
                Daftar Sekarang
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/alumni" prefetch={false} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 border-white bg-black text-white hover:bg-white hover:text-black")}>
                Lihat Direktori
              </Link>
            </div>
          </div>
          <div className="border border-black bg-[#b3bd95] p-5 text-black sm:p-6">
            <MapPinnedIcon className="size-7" aria-hidden="true" />
            <p className="mt-8 font-sans text-xs font-bold uppercase">Jejak alumni</p>
            <h2 className="mt-2 max-w-md font-display text-2xl uppercase leading-none">
              Cerita sekolah yang terus bergerak ke berbagai penjuru Indonesia.
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black pt-5">
              <div>
                <p className="font-display text-2xl">{totalAlumni}</p>
                <p className="mt-1 text-xs">Alumni aktif</p>
              </div>
              <div>
                <p className="font-display text-2xl">{totalPosts}</p>
                <p className="mt-1 text-xs">Cerita</p>
              </div>
              <div>
                <p className="font-display text-2xl">{totalGallery}</p>
                <p className="mt-1 text-xs">Kenangan</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="border border-black bg-[#d77a7a] p-5 text-black">
            <p className="font-sans text-xs font-bold uppercase">Komunitas digital</p>
            <h2 className="mt-2 font-display text-3xl uppercase leading-none">Ruang bersama yang terus bertumbuh.</h2>
            <p className="mt-3 max-w-xl leading-6">
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
          <div className="mb-6 max-w-3xl border border-black bg-[#8e8a25] p-5 text-black">
            <p className="font-sans text-xs font-bold uppercase">Persebaran alumni</p>
            <h2 className="mt-2 font-display text-3xl uppercase leading-none">Dari sekolah yang sama, menuju kota yang berbeda.</h2>
            <p className="mt-3 leading-6">
              Peta domisili membantu melihat bagaimana jejaring SYP-33-6 bertumbuh di berbagai daerah.
            </p>
          </div>
          <IndonesiaDistributionMap locations={domicileDistribution} />
        </div>
      </section>

      <section className="container py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="border border-black bg-[#9ab6c8] p-4 text-black">
            <p className="font-sans text-xs font-bold uppercase">Potret kebersamaan</p>
            <h2 className="mt-2 font-display text-3xl uppercase leading-none">Galeri Kenangan</h2>
            <p className="mt-2 text-sm">Momen sekolah dan pertemuan alumni yang layak dikenang kembali.</p>
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
              <p className="font-sans text-xs font-bold uppercase">Kenali kembali teman lama</p>
              <h2 className="mt-2 font-display text-3xl uppercase leading-none">Alumni Terbaru</h2>
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
            <p className="font-sans text-xs font-bold uppercase">Cerita dari alumni</p>
            <h2 className="mt-2 font-display text-3xl uppercase leading-none">Postingan Terbaru</h2>
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
