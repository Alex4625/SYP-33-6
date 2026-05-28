import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { PostCard } from "@/components/shared/PostCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Postingan",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number((Array.isArray(params.halaman) ? params.halaman[0] : params.halaman) ?? "1"));
  const take = 10;
  const skip = (page - 1) * take;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { isHidden: false, author: { status: "APPROVED" } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        images: { orderBy: { orderIndex: "asc" } },
        author: {
          select: {
            username: true,
            alumniProfile: { select: { fullName: true, profilePhotoUrl: true } },
          },
        },
      },
    }),
    prisma.post.count({ where: { isHidden: false, author: { status: "APPROVED" } } }),
  ]);

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Postingan Alumni</h1>
        <p className="mt-2 text-muted-foreground">Kumpulan cerita dan kenangan yang dibagikan alumni.</p>
      </div>
      {posts.length > 0 ? (
        <div className="grid gap-5">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <EmptyState title="Belum ada postingan" description="Postingan alumni akan tampil di halaman ini." />
      )}
      <PaginationLinks basePath="/postingan" currentPage={page} totalPages={Math.max(1, Math.ceil(total / take))} searchParams={params} />
    </div>
  );
}
