import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PowerIcon, Trash2Icon } from "lucide-react";

import { AdminAlumniForm } from "@/app/(admin)/admin/alumni/[id]/AdminAlumniForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAlumni, toggleAlumniStatus } from "@/lib/actions";
import { getUserWithProfileById } from "@/lib/data";
import { formatDate } from "@/lib/format";

type Params = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserWithProfileById(id);
  return { title: user?.alumniProfile?.fullName ?? "Detail Alumni" };
}

export default async function AdminAlumniDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const user = await getUserWithProfileById(id);

  if (!user || !user.alumniProfile || user.role !== "ALUMNI") notFound();

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{user.alumniProfile.fullName}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={user.status} />
            <span className="text-sm text-muted-foreground">Terdaftar {formatDate(user.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <form action={toggleAlumniStatus.bind(null, user.id)}>
            <Button type="submit" variant="outline">
              <PowerIcon className="size-4" />
              {user.status === "DISABLED" ? "Aktifkan" : "Nonaktifkan"}
            </Button>
          </form>
          <form action={deleteAlumni.bind(null, user.id)}>
            <Button type="submit" variant="destructive">
              <Trash2Icon className="size-4" />
              Hapus
            </Button>
          </form>
        </div>
      </div>
      <Card className="mb-6 rounded-lg">
        <CardContent className="grid gap-3 p-5 text-sm md:grid-cols-2">
          <p><span className="font-medium">Username:</span> {user.username}</p>
          <p><span className="font-medium">Email:</span> {user.alumniProfile.email ?? "-"}</p>
          <p><span className="font-medium">Nomor HP:</span> {user.alumniProfile.phone ?? "-"}</p>
          <p><span className="font-medium">Tanggal lahir:</span> {formatDate(user.alumniProfile.birthDate)}</p>
        </CardContent>
      </Card>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Edit Data Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminAlumniForm userId={user.id} profile={user.alumniProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
