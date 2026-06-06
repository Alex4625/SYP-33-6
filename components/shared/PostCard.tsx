"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ImagesIcon, UserRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate, truncateText } from "@/lib/format";
import { mediaVariantUrl } from "@/lib/media";

const LazyLightbox = dynamic(() => import("@/components/shared/Lightbox").then((mod) => mod.Lightbox), {
  ssr: false,
});

const LazyCaptionDialog = dynamic(() => import("@/components/shared/PostCaptionDialog").then((mod) => mod.PostCaptionDialog), {
  ssr: false,
});

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

export function PostCard({
  post,
  compact = false,
  priorityImage = false,
}: {
  post: PostCardData;
  compact?: boolean;
  priorityImage?: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [captionOpen, setCaptionOpen] = useState(false);
  const authorName = post.author.alumniProfile?.fullName ?? post.author.username;
  const dateLabel = formatShortDate(post.createdAt);
  const profilePhoto = post.author.alumniProfile?.profilePhotoUrl;
  const profilePhotoThumb = profilePhoto ? mediaVariantUrl(profilePhoto, 96, 76) : null;
  const images = useMemo(
    () => [...post.images].sort((a, b) => a.orderIndex - b.orderIndex),
    [post.images],
  );
  const coverImage = images[0];
  const coverImageThumb = coverImage
    ? mediaVariantUrl(coverImage.imageUrl, compact ? 520 : 960, compact ? 76 : 80)
    : null;
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
      <Card className="overflow-hidden border-black bg-card dark:border-border">
        <CardContent className="p-0">
          <div className={compact ? "flex items-center gap-2.5 p-3" : "flex items-center gap-3 p-4"}>
            <div className={compact ? "relative size-9 overflow-hidden border border-black bg-muted dark:border-border" : "relative size-10 overflow-hidden border border-black bg-muted dark:border-border"}>
              {profilePhotoThumb ? (
                <Image src={profilePhotoThumb} alt={authorName} fill className="object-cover" sizes="40px" />
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
              <p className="text-xs text-muted-foreground">{dateLabel}</p>
            </div>
          </div>
          {coverImage ? (
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              className="group relative block aspect-[4/3] w-full overflow-hidden bg-muted outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Buka ${images.length === 1 ? "foto" : `${images.length} foto`} postingan ${authorName}`}
            >
              <Image
                src={coverImageThumb ?? coverImage.imageUrl}
                alt="Foto utama postingan"
                fill
                className="object-cover"
                sizes={compact ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 768px) 768px, 100vw"}
                priority={priorityImage}
                fetchPriority={priorityImage ? "high" : undefined}
              />
              {images.length > 1 ? (
                <span className="catalog-bevel absolute right-2 top-2 flex items-center gap-1.5 border border-black bg-accent px-2 py-1 font-sans text-xs font-bold uppercase text-black">
                  <ImagesIcon className="size-4" aria-hidden="true" />
                  {images.length} foto
                </span>
              ) : null}
            </button>
          ) : null}
          <div className={compact ? "p-3" : "p-4"}>
            <p className={compact ? "line-clamp-3 whitespace-pre-line text-sm leading-5" : "whitespace-pre-line text-sm leading-6"}>
              {truncateText(post.caption, compact ? 180 : 300)}
            </p>
            {compact ? (
              <Button
                type="button"
                variant="link"
                className="mt-1 h-auto p-0 text-xs"
                onClick={() => setCaptionOpen(true)}
                aria-label={`Baca selengkapnya caption postingan ${authorName}`}
              >
                Baca selengkapnya
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      {lightboxOpen ? (
        <LazyLightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={slides}
          index={lightboxIndex}
          setIndex={setLightboxIndex}
        />
      ) : null}
      {captionOpen ? (
        <LazyCaptionDialog
          open={captionOpen}
          onOpenChange={setCaptionOpen}
          authorName={authorName}
          dateLabel={dateLabel}
          caption={post.caption}
        />
      ) : null}
    </>
  );
}
