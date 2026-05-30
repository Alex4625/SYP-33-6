"use client";

import Image from "next/image";
import Link from "next/link";
import { ImagesIcon, UserRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Lightbox } from "@/components/shared/Lightbox";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate, truncateText } from "@/lib/format";

export type PostCardData = {
  id: string;
  caption: string;
  createdAt: Date | string;
  author: {
    username: string;
    alumniProfile: {
      fullName: string;
      profilePhotoUrl?: string | null;
    } | null;
  };
  images: {
    id: string;
    imageUrl: string;
    orderIndex: number;
  }[];
};

export function PostCard({ post, compact = false }: { post: PostCardData; compact?: boolean }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const authorName = post.author.alumniProfile?.fullName ?? post.author.username;
  const profilePhoto = post.author.alumniProfile?.profilePhotoUrl;
  const images = useMemo(
    () => [...post.images].sort((a, b) => a.orderIndex - b.orderIndex),
    [post.images],
  );
  const slides = useMemo(
    () =>
      images.map((image, index) => ({
        src: image.imageUrl,
        title: `${authorName} - foto ${index + 1} dari ${images.length}`,
        description: post.caption,
      })),
    [authorName, images, post.caption],
  );

  return (
    <>
      <Card className="overflow-hidden rounded-lg border-border/80 bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="relative size-10 overflow-hidden rounded-lg bg-muted">
              {profilePhoto ? (
                <Image src={profilePhoto} alt={authorName} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <UserRoundIcon className="size-5" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link href={`/alumni/${post.author.username}`} prefetch={false} className="line-clamp-1 text-sm font-semibold hover:text-primary">
                {authorName}
              </Link>
              <p className="text-xs text-muted-foreground">{formatShortDate(post.createdAt)}</p>
            </div>
          </div>
          {images[0] ? (
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              className="group relative block aspect-[4/3] w-full overflow-hidden bg-black/90 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Buka ${images.length === 1 ? "foto" : `${images.length} foto`} postingan ${authorName}`}
            >
              <Image
                src={images[0].imageUrl}
                alt="Foto utama postingan"
                fill
                className="object-contain transition duration-300 group-hover:scale-[1.02]"
                sizes="(min-width: 768px) 768px, 100vw"
              />
              {images.length > 1 ? (
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white">
                  <ImagesIcon className="size-4" aria-hidden="true" />
                  {images.length} foto
                </span>
              ) : null}
            </button>
          ) : null}
          <p className="whitespace-pre-line p-4 text-sm leading-6">{truncateText(post.caption, compact ? 180 : 300)}</p>
        </CardContent>
      </Card>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
        setIndex={setLightboxIndex}
      />
    </>
  );
}
