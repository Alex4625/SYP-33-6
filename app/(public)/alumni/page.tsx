import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { AlumniCard } from "@/components/shared/AlumniCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Direktori Alumni",
};

export const revalidate = 60;

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
  const domisili = param(params, "domisili");

  const where: Prisma.AlumniProfileWhereInput = {
    user: { role: "ALUMNI", status: "APPROVED" },
    ...(q ? { fullName: { contains: q } } : {}),
    ...(jurusan === "IPA" || jurusan === "IPS" ? { highSchoolMajor: jurusan } : {}),
    ...(prodi ? { collegeMajor: { contains: prodi } } : {}),
    ...(domisili
      ? {
          OR: [
            { domicileCity: { contains: domisili } },
            { domicileProvince: { contains: domisili } },
            { originCity: { contains: domisili } },
            { originProvince: { contains: domisili } },
          ],
        }
      : {}),
  };

  const [alumni, total] = await prisma.$transaction([
    prisma.alumniProfile.findMany({
      where,
      orderBy: { fullName: "asc" },
      skip,
      take,
      select: {
        fullName: true,
        highSchoolMajor: true,
        collegeMajor: true,
        domicileCity: true,
        domicileProvince: true,
        profilePhotoUrl: true,
        user: { select: { username: true } },
      },
    }),
    prisma.alumniProfile.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Direktori Alumni</h1>
        <p className="mt-2 text-muted-foreground">Cari alumni berdasarkan nama, jurusan, program studi, atau domisili.</p>
      </div>
      <FilterBar searchParams={params} />
      {alumni.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alumni.map((item) => <AlumniCard key={item.user.username} alumni={item} />)}
        </div>
      ) : (
        <EmptyState className="mt-6" title="Alumni tidak ditemukan" description="Coba ubah kata kunci atau filter pencarian." />
      )}
      <PaginationLinks basePath="/alumni" currentPage={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
