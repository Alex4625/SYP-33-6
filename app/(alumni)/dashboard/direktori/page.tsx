import type { Metadata } from "next";

import { AlumniCard } from "@/components/shared/AlumniCard";
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

export default async function DashboardDirectoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(param(params, "halaman") || "1"));
  const take = 12;
  const skip = (page - 1) * take;
  const filters = {
    q: param(params, "q"),
    jurusan: param(params, "jurusan"),
    prodi: param(params, "prodi"),
  };
  const filterParams = {
    q: filters.q || undefined,
    jurusan: filters.jurusan || undefined,
    prodi: filters.prodi || undefined,
  };

  const [alumni, total] = await Promise.all([
    getAlumniCards(filters, take, skip),
    countAlumniCards(filters),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Direktori Alumni</h1>
        <p className="mt-2 text-muted-foreground">
          Cari alumni tanpa meninggalkan area dashboard.
        </p>
      </div>
      <FilterBar action="/dashboard/direktori" searchParams={filterParams} />
      {alumni.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alumni.map((item) => <AlumniCard key={item.user.username} alumni={item} />)}
        </div>
      ) : (
        <EmptyState className="mt-6" title="Alumni tidak ditemukan" description="Coba ubah kata kunci atau filter pencarian." />
      )}
      <PaginationLinks basePath="/dashboard/direktori" currentPage={page} totalPages={totalPages} searchParams={filterParams} />
    </div>
  );
}
