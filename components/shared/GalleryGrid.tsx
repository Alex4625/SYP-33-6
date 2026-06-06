"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { formatShortDate } from "@/lib/format";
import { mediaVariantUrl } from "@/lib/media";

const LazyLightbox = dynamic(() => import("@/components/shared/Lightbox").then((mod) => mod.Lightbox), {
  ssr: false,
});

export type GalleryPhotoData = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: Date | string;
  uploadedBy: {
    username: string;
    alumniProfile: {
      fullName: string;
    } | null;
  };
};

export function GalleryGrid({ photos, priorityFirst = false }: { photos: GalleryPhotoData[]; priorityFirst?: boolean }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const slides = useMemo(
    () =>
      photos.map((photo) => ({
        src: photo.imageUrl,
        title: photo.caption ?? "Foto kenangan",
        description: `${photo.uploadedBy.alumniProfile?.fullName ?? photo.uploadedBy.username} - ${formatShortDate(photo.createdAt)}`,
      })),
    [photos],
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((photo, photoIndex) => {
          const uploaderName = photo.uploadedBy.alumniProfile?.fullName ?? photo.uploadedBy.username;
          const title = photo.caption ?? "Kenangan SYP-33-6";
          const thumbnailUrl = mediaVariantUrl(photo.imageUrl, 640, 78) ?? photo.imageUrl;

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => {
                setIndex(photoIndex);
                setOpen(true);
              }}
              className="group relative aspect-[4/3] overflow-hidden border border-black bg-muted text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-border"
              aria-label={`${title} ${uploaderName}. Buka foto galeri.`}
            >
              <Image
                src={thumbnailUrl}
                alt={`Foto galeri ${title}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                priority={priorityFirst && photoIndex === 0}
                fetchPriority={priorityFirst && photoIndex === 0 ? "high" : undefined}
              />
              <span className="absolute inset-x-0 bottom-0 border-t border-black bg-background p-2 text-foreground dark:border-border">
                <span className="line-clamp-1 font-sans text-xs font-bold uppercase">{title}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{uploaderName}</span>
              </span>
            </button>
          );
        })}
      </div>
      {open ? <LazyLightbox open={open} close={() => setOpen(false)} slides={slides} index={index} setIndex={setIndex} /> : null}
    </>
  );
}
