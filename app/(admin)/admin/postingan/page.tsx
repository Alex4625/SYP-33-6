import type { Metadata } from "next";
import { EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminDeletePost, togglePostVisibility } from "@/lib/actions";
import { getAdminPosts } from "@/lib/data";
import { formatShortDate, truncateText } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Postingan",
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = value(params, "q");
  const status = value(params, "status");

  const posts = await getAdminPosts({ q, status });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Kelola Postingan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sembunyikan atau hapus postingan alumni.</p>
      </div>
      <form className="mb-4 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_auto]">
        <Input name="q" defaultValue={q} placeholder="Cari pembuat postingan" />
        <select name="status" defaultValue={status} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
          <option value="">Semua</option>
          <option value="public">Publik</option>
          <option value="hidden">Tersembunyi</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pembuat</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.author.alumniProfile?.fullName ?? post.author.username}</TableCell>
                <TableCell className="max-w-xs">{truncateText(post.caption, 120)}</TableCell>
                <TableCell>{post.images.length}</TableCell>
                <TableCell>{post.isHidden ? <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">Disembunyikan</span> : <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Publik</span>}</TableCell>
                <TableCell>{formatShortDate(post.createdAt)}</TableCell>
                <TableCell className="flex flex-wrap gap-2">
                  <form action={togglePostVisibility.bind(null, post.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      {post.isHidden ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                      {post.isHidden ? "Tampilkan" : "Sembunyikan"}
                    </Button>
                  </form>
                  <form action={adminDeletePost.bind(null, post.id)}>
                    <Button type="submit" size="sm" variant="destructive">
                      <Trash2Icon className="size-4" />
                      Hapus
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
