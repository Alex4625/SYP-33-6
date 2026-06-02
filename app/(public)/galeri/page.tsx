import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/EmptyState";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { GalleryGrid } from "@/components/shared/GalleryGrid";
import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { countGalleryPhotos, getGalleryPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Kenangan",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function GalleryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number((Array.isArray(params.halaman) ? params.halaman[0] : params.halaman) ?? "1"));
  const take = 20;
  const skip = (page - 1) * take;

  const [photos, total] = await Promise.all([
    getGalleryPhotos({ limit: take, offset: skip, publicOnly: true }),
    countGalleryPhotos(true),
  ]);

  return (
    <div className="container py-10">
      <CatalogPageHeader title="Galeri Kenangan" description="Foto-foto kolektif dari masa sekolah dan pertemuan alumni." tint="sky" />
      {photos.length > 0 ? <GalleryGrid photos={photos} /> : <EmptyState title="Belum ada foto" description="Foto galeri akan tampil setelah alumni atau admin mengunggah kenangan." />}
      <PaginationLinks basePath="/galeri" currentPage={page} totalPages={Math.max(1, Math.ceil(total / take))} searchParams={params} />
    </div>
  );
}
