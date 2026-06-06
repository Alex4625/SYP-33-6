import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePlusIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { deleteOwnGalleryPhoto } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { getOwnGalleryPhotos } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { mediaVariantUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Saya",
};

export default async function MyGalleryPage() {
  const session = await auth();
  const photos = await getOwnGalleryPhotos(session!.user.id);

  return (
    <div className="container py-8">
      <CatalogPageHeader
        title="Galeri Saya"
        description="Kelola foto kenangan yang sudah Anda unggah."
        tint="sky"
        action={<Link href="/dashboard/galeri/upload" className={cn(buttonVariants())}>
          <ImagePlusIcon className="size-4" aria-hidden="true" />
          Upload Foto
        </Link>}
      />

      {photos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => {
            const thumbnailUrl = mediaVariantUrl(photo.imageUrl, 640, 78) ?? photo.imageUrl;

            return (
            <article key={photo.id} className="overflow-hidden border border-black bg-card dark:border-border">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={thumbnailUrl} alt={photo.caption ?? "Foto galeri"} fill className="object-cover" sizes="280px" />
              </div>
              <div className="space-y-3 p-3">
                <p className="line-clamp-2 text-sm">{photo.caption ?? "Tanpa keterangan"}</p>
                <p className="text-xs text-muted-foreground">{formatShortDate(photo.createdAt)}</p>
                <ConfirmDialog
                  title="Hapus foto galeri?"
                  description="Foto akan dihapus permanen dari galeri dan penyimpanan."
                  action={deleteOwnGalleryPhoto.bind(null, photo.id)}
                  actionLabel="Hapus"
                  triggerIcon="trash"
                />
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Belum ada foto galeri"
          description="Upload foto pertama untuk membagikan kenangan dengan alumni lainnya."
        />
      )}
    </div>
  );
}
