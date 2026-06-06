import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileTextIcon, PencilIcon, PlusIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteOwnPost } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { getPostCards } from "@/lib/data";
import { formatShortDate, truncateText } from "@/lib/format";
import { mediaVariantUrl } from "@/lib/media";
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
      <CatalogPageHeader
        title="Postingan Saya"
        description="Kelola postingan yang sudah Anda bagikan."
        tint="salmon"
        action={<Link href="/dashboard/postingan/baru" className={cn(buttonVariants())}>
          <PlusIcon className="size-4" aria-hidden="true" />
          Buat
        </Link>}
      />
      {posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const imageUrl = post.images[0] ? mediaVariantUrl(post.images[0].imageUrl, 640, 78) : null;

            return (
            <Card key={post.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {post.images[0] ? (
                  <Image src={imageUrl ?? post.images[0].imageUrl} alt="Foto postingan" fill className="object-cover" sizes="320px" />
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
            );
          })}
        </div>
      ) : (
        <EmptyState title="Belum ada postingan" description="Buat postingan pertama untuk membagikan kenangan." />
      )}
    </div>
  );
}
