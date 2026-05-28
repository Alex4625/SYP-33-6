import Image from "next/image";
import Link from "next/link";
import { UserRoundIcon } from "lucide-react";

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
  const authorName = post.author.alumniProfile?.fullName ?? post.author.username;
  const profilePhoto = post.author.alumniProfile?.profilePhotoUrl;
  const images = [...post.images].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
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
            <Link href={`/alumni/${post.author.username}`} className="line-clamp-1 text-sm font-semibold hover:text-primary">
              {authorName}
            </Link>
            <p className="text-xs text-muted-foreground">{formatShortDate(post.createdAt)}</p>
          </div>
        </div>
        {images.length > 0 ? (
          <div className={images.length === 1 ? "relative aspect-[4/3] bg-muted" : "grid grid-cols-2 gap-1 bg-muted p-1"}>
            {images.slice(0, compact ? 2 : 4).map((image) => (
              <div key={image.id} className={images.length === 1 ? "absolute inset-0" : "relative aspect-square overflow-hidden rounded-md"}>
                <Image src={image.imageUrl} alt="Foto postingan" fill className="object-cover" sizes="(min-width: 768px) 480px, 100vw" />
              </div>
            ))}
          </div>
        ) : null}
        <p className="whitespace-pre-line p-4 text-sm leading-6">{truncateText(post.caption, compact ? 180 : 300)}</p>
      </CardContent>
    </Card>
  );
}
