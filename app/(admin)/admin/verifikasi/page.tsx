import type { Metadata } from "next";
import { CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveAlumni, rejectAlumni } from "@/lib/actions";
import { getPendingUsers } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi Alumni",
};

export default async function VerificationPage() {
  const users = await getPendingUsers();

  async function rejectAction(formData: FormData) {
    "use server";
    await rejectAlumni(formData);
  }

  return (
    <div className="container py-8">
      <CatalogPageHeader
        eyebrow="Panel Admin"
        title="Verifikasi Alumni"
        description="Setujui atau tolak registrasi yang menunggu pemeriksaan."
        tint="lime"
      />
      <div className="overflow-hidden border border-black bg-card dark:border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Program studi</TableHead>
              <TableHead>Tanggal daftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.alumniProfile?.fullName ?? "-"}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.alumniProfile?.highSchoolMajor ?? "-"}</TableCell>
                <TableCell>{user.alumniProfile?.collegeMajor ?? "-"}</TableCell>
                <TableCell>{formatShortDate(user.createdAt)}</TableCell>
                <TableCell className="space-y-2">
                  <form action={approveAlumni.bind(null, user.id)}>
                    <Button type="submit" size="sm">
                      <CheckIcon className="size-4" aria-hidden="true" />
                      Approve
                    </Button>
                  </form>
                  <form action={rejectAction} className="flex gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <Input name="reason" placeholder="Alasan penolakan" className="w-48" />
                    <Button type="submit" variant="destructive" size="sm">
                      <XIcon className="size-4" aria-hidden="true" />
                      Reject
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
