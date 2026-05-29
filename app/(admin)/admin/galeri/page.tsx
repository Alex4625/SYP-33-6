import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImagePlusIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminDeleteGalleryPhoto, toggleGalleryVisibility } from "@/lib/actions";
import { getAdminGallery } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Galeri",
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = value(params, "q");
  const status = value(params, "status");

  const photos = await getAdminGallery({ q, status });

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Kelola Galeri</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atur visibilitas dan hapus foto galeri.</p>
        </div>
        <Link href="/admin/galeri/upload" className={cn(buttonVariants())}>
          <ImagePlusIcon className="size-4" />
          Upload Foto
        </Link>
      </div>
      <form className="mb-4 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_auto]">
        <Input name="q" defaultValue={q} placeholder="Cari pengunggah" />
        <select name="status" defaultValue={status} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
          <option value="">Semua</option>
          <option value="public">Publik</option>
          <option value="hidden">Tersembunyi</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="overflow-hidden rounded-lg border bg-card">
            <div className="relative aspect-[4/3] bg-muted">
              <Image src={photo.imageUrl} alt={photo.caption ?? "Foto galeri"} fill className="object-cover" sizes="280px" />
              <span className={cn("absolute left-2 top-2 rounded-md px-2 py-1 text-xs", photo.isHidden ? "bg-zinc-900/80 text-white" : "bg-emerald-600/90 text-white")}>
                {photo.isHidden ? "Tersembunyi" : "Publik"}
              </span>
            </div>
            <div className="space-y-3 p-3 text-sm">
              <p className="line-clamp-2">{photo.caption ?? "Tanpa keterangan"}</p>
              <p className="text-xs text-muted-foreground">
                {photo.uploadedBy.alumniProfile?.fullName ?? photo.uploadedBy.username} - {formatShortDate(photo.createdAt)}
              </p>
              <div className="flex flex-wrap gap-2">
                <ConfirmDialog
                  title={photo.isHidden ? "Tampilkan foto?" : "Sembunyikan foto?"}
                  description={
                    photo.isHidden
                      ? "Foto akan kembali tampil di galeri publik."
                      : "Foto akan disembunyikan dari galeri publik."
                  }
                  action={toggleGalleryVisibility.bind(null, photo.id)}
                  actionLabel={photo.isHidden ? "Tampilkan" : "Sembunyikan"}
                  variant="warning"
                  triggerIcon={photo.isHidden ? "eye" : "eye-off"}
                >
                  {photo.isHidden ? "Tampilkan" : "Sembunyikan"}
                </ConfirmDialog>
                <ConfirmDialog
                  title="Hapus foto galeri?"
                  description="Foto akan dihapus permanen dari database dan storage."
                  action={adminDeleteGalleryPhoto.bind(null, photo.id)}
                  actionLabel="Hapus"
                  triggerIcon="trash"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
