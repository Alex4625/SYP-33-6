import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileForm } from "@/app/(alumni)/dashboard/profil/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Profil",
};

export default async function ProfilePage() {
  const session = await auth();
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: session!.user.id } });
  if (!profile) notFound();

  return (
    <div className="container py-8">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
