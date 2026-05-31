import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePlusIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { deleteOwnGalleryPhoto } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { getOwnGalleryPhotos } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Galeri Saya</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola foto kenangan yang sudah Anda unggah.</p>
        </div>
        <Link href="/dashboard/galeri/upload" className={cn(buttonVariants())}>
          <ImagePlusIcon className="size-4" aria-hidden="true" />
          Upload Foto
        </Link>
      </div>

      {photos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo) => (
            <article key={photo.id} className="overflow-hidden rounded-lg border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={photo.imageUrl} alt={photo.caption ?? "Foto galeri"} fill className="object-cover" sizes="280px" />
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
          ))}
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
