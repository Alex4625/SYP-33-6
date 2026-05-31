import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileTextIcon, PencilIcon, PlusIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteOwnPost } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { getPostCards } from "@/lib/data";
import { formatShortDate, truncateText } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Postingan Saya",
};

export default async function MyPostsPage() {
  const session = await auth();
  const posts = await getPostCards({ limit: 100, userId: session!.user.id });

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Postingan Saya</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola postingan yang sudah Anda bagikan.</p>
        </div>
        <Link href="/dashboard/postingan/baru" className={cn(buttonVariants())}>
          <PlusIcon className="size-4" aria-hidden="true" />
          Buat
        </Link>
      </div>
      {posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden rounded-lg">
              <div className="relative aspect-[4/3] bg-muted">
                {post.images[0] ? (
                  <Image src={post.images[0].imageUrl} alt="Foto postingan" fill className="object-cover" sizes="320px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <FileTextIcon className="size-10" aria-hidden="true" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{formatShortDate(post.createdAt)}</p>
                <p className="mt-2 min-h-12 text-sm">{truncateText(post.caption, 120)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/dashboard/postingan/${post.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    <PencilIcon className="size-4" aria-hidden="true" />
                    Edit
                  </Link>
                  <ConfirmDialog
                    title="Hapus postingan?"
                    description="Postingan dan semua fotonya akan dihapus permanen."
                    action={deleteOwnPost.bind(null, post.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada postingan" description="Buat postingan pertama untuk membagikan kenangan." />
      )}
    </div>
  );
}
