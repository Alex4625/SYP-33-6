import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2Icon, Clock3Icon, UserXIcon, UsersRoundIcon } from "lucide-react";

import { AdminCharts } from "@/components/shared/AdminCharts";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminDashboardData } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

function monthKey(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(date);
}

function monthSqlKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export default async function AdminDashboardPage() {
  const {
    total,
    pending,
    approved,
    disabled,
    postPublic,
    postHidden,
    galleryPublic,
    galleryHidden,
    majorGroup,
    collegeGroup,
    domicileGroup,
    originGroup,
    recentUsers,
    monthlyGroup,
    now,
  } = await getAdminDashboardData();
  const monthlyMap = new Map(monthlyGroup.map((item) => [item.key, item.value]));

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    return { name: monthKey(date), total: monthlyMap.get(monthSqlKey(date)) ?? 0 };
  });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan pertumbuhan dan aktivitas komunitas alumni.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Alumni" value={total} icon={UsersRoundIcon} />
        <StatsCard title="Menunggu Verifikasi" value={pending} icon={Clock3Icon} className="border-amber-300" />
        <StatsCard title="Alumni Aktif" value={approved} icon={CheckCircle2Icon} className="border-emerald-300" />
        <StatsCard title="Alumni Nonaktif" value={disabled} icon={UserXIcon} className="border-rose-300" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StatsCard title="Postingan" value={`${postPublic} publik / ${postHidden} tersembunyi`} />
        <StatsCard title="Foto Galeri" value={`${galleryPublic} publik / ${galleryHidden} tersembunyi`} />
      </div>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <AdminCharts
            majorData={majorGroup.map((item) => ({ name: item.name, value: item.value }))}
            collegeData={collegeGroup.map((item) => ({ name: item.name, value: item.value }))}
            domicileData={domicileGroup.map((item) => ({ name: item.name ?? "-", value: item.value }))}
            originData={originGroup.map((item) => ({ name: item.name ?? "-", value: item.value }))}
            monthlyData={months}
          />
        </Suspense>
      </div>
      <Card className="mt-6 rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">Alumni Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.alumniProfile?.fullName ?? "-"}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell>{formatShortDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
