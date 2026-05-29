import type { Metadata } from "next";
import Link from "next/link";
import { EyeIcon, PowerIcon, Trash2Icon } from "lucide-react";

import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteAlumni, toggleAlumniStatus } from "@/lib/actions";
import { getAdminUsers } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Alumni",
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

export default async function AdminAlumniPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(value(params, "halaman") || "1"));
  const q = value(params, "q");
  const status = value(params, "status");
  const take = 20;
  const skip = (page - 1) * take;

  const { users, total } = await getAdminUsers({ q, status, limit: take, offset: skip });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Alumni</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cari, filter, dan kelola semua akun alumni.</p>
      </div>
      <form className="mb-4 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_auto]">
        <Input name="q" defaultValue={q} placeholder="Cari nama atau username" />
        <select name="status" defaultValue={status} className="h-8 rounded-lg border border-input bg-background px-2 text-sm">
          <option value="">Semua status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Daftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.alumniProfile?.fullName ?? "-"}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.alumniProfile?.highSchoolMajor ?? "-"}</TableCell>
                <TableCell><StatusBadge status={user.status} /></TableCell>
                <TableCell>{formatShortDate(user.createdAt)}</TableCell>
                <TableCell className="flex flex-wrap gap-2">
                  <Link href={`/admin/alumni/${user.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    <EyeIcon className="size-4" />
                    Detail
                  </Link>
                  <form action={toggleAlumniStatus.bind(null, user.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      <PowerIcon className="size-4" />
                      {user.status === "DISABLED" ? "Aktifkan" : "Nonaktifkan"}
                    </Button>
                  </form>
                  <form action={deleteAlumni.bind(null, user.id)}>
                    <Button type="submit" variant="destructive" size="sm">
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
      <PaginationLinks basePath="/admin/alumni" currentPage={page} totalPages={Math.max(1, Math.ceil(total / take))} searchParams={params} />
    </div>
  );
}
