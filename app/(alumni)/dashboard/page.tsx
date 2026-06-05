import type { Metadata } from "next";
import Link from "next/link";
import { Edit3Icon, FilePlus2Icon, ImagePlusIcon, UsersRoundIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { BirthdayAnnouncement } from "@/components/shared/BirthdayAnnouncement";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { PostCard } from "@/components/shared/PostCard";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getTodayBirthdays } from "@/lib/birthdays";
import { getPostCards, getProfileByUserId } from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Alumni",
};

export default async function AlumniDashboardPage() {
  const session = await auth();
  const [profile, latestPosts, todayBirthdays] = await Promise.all([
    getProfileByUserId(session!.user.id),
    getPostCards({ limit: 3, userId: session!.user.id }),
    getTodayBirthdays(),
  ]);

  const quickLinks = [
    { href: "/dashboard/profil", label: "Edit Profil", icon: Edit3Icon },
    { href: "/dashboard/postingan/baru", label: "Buat Postingan", icon: FilePlus2Icon },
    { href: "/dashboard/galeri", label: "Kelola Galeri", icon: ImagePlusIcon },
    { href: "/dashboard/direktori", label: "Direktori Alumni", icon: UsersRoundIcon },
  ];

  return (
    <div className="container py-8">
      <CatalogPageHeader
        eyebrow="Selamat datang kembali"
        title={profile?.fullName ?? session?.user.name ?? "Alumni"}
        description="Kelola profil, bagikan cerita, dan temukan kembali teman sekolah."
        tint="lime"
      />
      <BirthdayAnnouncement birthdays={todayBirthdays} className="mb-6" />
      <div className="grid gap-4 md:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="transition hover:bg-accent/15">
                <CardContent className="p-4">
                  <span className="catalog-bevel mb-4 inline-flex bg-accent p-2 text-black">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="font-sans text-xs font-bold uppercase">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl uppercase leading-none">Postingan Terbaru Saya</h2>
          <Link href="/dashboard/postingan" className={cn(buttonVariants({ variant: "outline" }))}>Kelola</Link>
        </div>
        {latestPosts.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {latestPosts.map((post) => <PostCard key={post.id} post={post} compact />)}
          </div>
        ) : (
          <EmptyState title="Belum ada postingan" description="Mulai bagikan cerita pertama Anda di komunitas alumni." />
        )}
      </section>
    </div>
  );
}
