import type { Metadata } from "next";

import { PaginationLinks } from "@/components/shared/PaginationLinks";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminLogs } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

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

  const { logs, total } = await getAdminLogs({ date, limit: take, offset: skip });

  return (
    <div className="container py-8">
      <CatalogPageHeader
        eyebrow="Panel Admin"
        title="Audit Log"
        description="Riwayat aksi admin di sistem."
        tint="steel"
      />
      <form className="mb-4 flex flex-wrap gap-3 border border-black bg-card p-4 dark:border-border">
        <Input type="date" name="tanggal" defaultValue={date} className="w-56" />
        <Button type="submit">Filter</Button>
      </form>
      <div className="overflow-hidden border border-black bg-card dark:border-border">
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
