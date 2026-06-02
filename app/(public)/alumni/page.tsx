import type { Metadata } from "next";

import { AlumniCard } from "@/components/shared/AlumniCard";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { countAlumniCards, getAlumniCards } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Direktori Alumni",
};

type SearchParams = Record<string, string | string[] | undefined>;

function param(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AlumniDirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(param(params, "halaman") || "1"));
  const take = 12;
  const skip = (page - 1) * take;
  const q = param(params, "q");
  const jurusan = param(params, "jurusan");
  const prodi = param(params, "prodi");

  const filters = { q, jurusan, prodi };
  const filterParams = { q: q || undefined, jurusan: jurusan || undefined, prodi: prodi || undefined };
  const [alumni, total] = await Promise.all([
    getAlumniCards(filters, take, skip),
    countAlumniCards(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="container py-10">
      <CatalogPageHeader title="Direktori Alumni" description="Cari alumni berdasarkan nama, jurusan, atau program studi." tint="sage" />
      <FilterBar searchParams={filterParams} />
      {alumni.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alumni.map((item) => <AlumniCard key={item.user.username} alumni={item} />)}
        </div>
      ) : (
        <EmptyState className="mt-6" title="Alumni tidak ditemukan" description="Coba ubah kata kunci atau filter pencarian." />
      )}
      <PaginationLinks basePath="/alumni" currentPage={page} totalPages={totalPages} searchParams={filterParams} />
    </div>
  );
}
