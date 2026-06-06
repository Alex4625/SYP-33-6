import Link from "next/link";
import { ImagesIcon, UserRoundIcon } from "lucide-react";

import { DeferredMediaImage } from "@/components/shared/DeferredMediaImage";
import type { PostCardData } from "@/components/shared/PostCard";
import { formatShortDate, truncateText } from "@/lib/format";
import { mediaVariantUrl } from "@/lib/media";

export function HomePostPreview({ posts }: { posts: PostCardData[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {posts.map((post) => {
        const authorName = post.author.alumniProfile?.fullName ?? post.author.username;
        const firstImage = [...post.images].sort((a, b) => a.orderIndex - b.orderIndex)[0];
        const thumbnailUrl = firstImage ? mediaVariantUrl(firstImage.imageUrl, 640, 78) : null;

        return (
          <article key={post.id} className="overflow-hidden border border-black bg-card dark:border-border">
            <div className="flex items-center gap-3 p-4">
              <span className="catalog-bevel flex size-10 shrink-0 items-center justify-center border border-black bg-muted dark:border-border">
                <UserRoundIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <Link
                  href={`/alumni/${post.author.username}`}
                  prefetch={false}
                  className="line-clamp-1 text-sm font-semibold hover:text-primary"
                >
                  {authorName}
                </Link>
                <p className="text-xs text-muted-foreground">{formatShortDate(post.createdAt)}</p>
              </div>
            </div>

            {firstImage ? (
              <Link
                href="/postingan"
                prefetch={false}
                className="group relative block aspect-[4/3] bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <DeferredMediaImage
                  src={thumbnailUrl ?? firstImage.imageUrl}
                  alt="Foto utama postingan"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {post.images.length > 1 ? (
                  <span className="catalog-bevel absolute right-2 top-2 flex items-center gap-1.5 border border-black bg-accent px-2 py-1 font-sans text-xs font-bold uppercase text-black">
                    <ImagesIcon className="size-4" aria-hidden="true" />
                    {post.images.length} foto
                  </span>
                ) : null}
              </Link>
            ) : null}

            <div className="p-4">
              <p className="line-clamp-4 whitespace-pre-line text-sm leading-6">
                {truncateText(post.caption, 220)}
              </p>
              <Link
                href="/postingan"
                prefetch={false}
                className="mt-2 inline-flex font-sans text-xs font-bold uppercase text-foreground underline-offset-4 hover:text-brand-700 hover:underline dark:hover:text-accent"
              >
                Baca selengkapnya
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
