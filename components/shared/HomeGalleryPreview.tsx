import Link from "next/link";

import { DeferredMediaImage } from "@/components/shared/DeferredMediaImage";
import type { GalleryPhotoData } from "@/components/shared/GalleryGrid";
import { formatShortDate } from "@/lib/format";

export function HomeGalleryPreview({ photos }: { photos: GalleryPhotoData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {photos.map((photo) => {
        const uploaderName = photo.uploadedBy.alumniProfile?.fullName ?? photo.uploadedBy.username;
        const title = photo.caption ?? "Kenangan SYP-33-6";

        return (
          <Link
            key={photo.id}
            href="/galeri"
            prefetch={false}
            className="group overflow-hidden border border-black bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-border"
          >
            <span className="relative block aspect-[4/3] bg-muted">
              <DeferredMediaImage
                src={photo.imageUrl}
                alt={`Foto galeri ${title}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </span>
            <span className="block border-t border-black p-3 dark:border-border">
              <span className="line-clamp-1 font-sans text-xs font-bold uppercase text-foreground group-hover:underline">
                {title}
              </span>
              <span className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {uploaderName} - {formatShortDate(photo.createdAt)}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
