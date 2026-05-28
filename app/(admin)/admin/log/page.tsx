import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Audit Log",
};

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

export default async function AdminLogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(value(params, "halaman") || "1"));
  const date = value(params, "tanggal");
  const take = 50;
  const skip = (page - 1) * take;

  const where: Prisma.AdminLogWhereInput = date
    ? {
        createdAt: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      }
    : {};

  const [logs, total] = await prisma.$transaction([
    prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { admin: true },
    }),
    prisma.adminLog.count({ where }),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">Riwayat aksi admin di sistem.</p>
      </div>
      <form className="mb-4 flex flex-wrap gap-3 rounded-lg border bg-card p-4">
        <Input type="date" name="tanggal" defaultValue={date} className="w-56" />
        <Button type="submit">Filter</Button>
      </form>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell>{log.admin.username}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.targetType} {log.targetId ?? ""}</TableCell>
                <TableCell>{log.description ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationLinks basePath="/admin/log" currentPage={page} totalPages={Math.max(1, Math.ceil(total / take))} searchParams={params} />
    </div>
  );
}
