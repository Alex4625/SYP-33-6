import type { Metadata } from "next";
import Link from "next/link";
import { Edit3Icon, FilePlus2Icon, ImagePlusIcon, UsersRoundIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PostCard } from "@/components/shared/PostCard";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Alumni",
};

export default async function AlumniDashboardPage() {
  const session = await auth();
  const profile = await prisma.alumniProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: {
        select: {
          username: true,
          posts: {
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
          },
        },
      },
    },
  });

  const quickLinks = [
    { href: "/dashboard/profil", label: "Edit Profil", icon: Edit3Icon },
    { href: "/dashboard/postingan/baru", label: "Buat Postingan", icon: FilePlus2Icon },
    { href: "/dashboard/galeri/upload", label: "Upload Galeri", icon: ImagePlusIcon },
    { href: "/alumni", label: "Direktori Alumni", icon: UsersRoundIcon },
  ];

  return (
    <div className="container py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
        <h1 className="text-3xl font-semibold">{profile?.fullName ?? session?.user.name}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="rounded-lg transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4">
                  <Icon className="mb-4 size-6 text-primary" aria-hidden="true" />
                  <p className="font-medium">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Postingan Terbaru Saya</h2>
          <Link href="/dashboard/postingan" className={cn(buttonVariants({ variant: "outline" }))}>Kelola</Link>
        </div>
        {profile?.user.posts.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {profile.user.posts.map((post) => <PostCard key={post.id} post={post} compact />)}
          </div>
        ) : (
          <EmptyState title="Belum ada postingan" description="Mulai bagikan cerita pertama Anda di komunitas alumni." />
        )}
      </section>
    </div>
  );
}
