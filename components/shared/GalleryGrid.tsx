"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Lightbox } from "@/components/shared/Lightbox";
import { formatShortDate } from "@/lib/format";

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

export function GalleryGrid({ photos }: { photos: GalleryPhotoData[] }) {
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
        {photos.map((photo, photoIndex) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => {
              setIndex(photoIndex);
              setOpen(true);
            }}
            className="group relative aspect-[4/3] overflow-hidden border border-black bg-muted text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-border"
          >
            <Image src={photo.imageUrl} alt={photo.caption ?? "Foto galeri"} fill className="object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
            <span className="absolute inset-x-0 bottom-0 border-t border-black bg-background p-2 text-foreground dark:border-border">
              <span className="line-clamp-1 font-sans text-xs font-bold uppercase">{photo.caption ?? "Kenangan SYP-33-6"}</span>
              <span className="line-clamp-1 text-xs text-muted-foreground">{photo.uploadedBy.alumniProfile?.fullName ?? photo.uploadedBy.username}</span>
            </span>
          </button>
        ))}
      </div>
      <Lightbox open={open} close={() => setOpen(false)} slides={slides} index={index} setIndex={setIndex} />
    </>
  );
}
