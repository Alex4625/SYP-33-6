import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { PostCard } from "@/components/shared/PostCard";
import { countPublicPosts, getPostCards } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Postingan",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number((Array.isArray(params.halaman) ? params.halaman[0] : params.halaman) ?? "1"));
  const take = 12;
  const skip = (page - 1) * take;

  const [posts, total] = await Promise.all([
    getPostCards({ limit: take, offset: skip, publicOnly: true }),
    countPublicPosts(),
  ]);

  return (
    <div className="container py-10">
      <div className="mb-6 border border-black bg-[#d77a7a] p-4 text-black">
        <h1 className="text-3xl uppercase">Postingan Alumni</h1>
        <p className="mt-2 text-muted-foreground">Kumpulan cerita dan kenangan yang dibagikan alumni.</p>
      </div>
      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => <PostCard key={post.id} post={post} compact />)}
        </div>
      ) : (
        <EmptyState title="Belum ada postingan" description="Postingan alumni akan tampil di halaman ini." />
      )}
      <PaginationLinks basePath="/postingan" currentPage={page} totalPages={Math.max(1, Math.ceil(total / take))} searchParams={params} />
    </div>
  );
}
