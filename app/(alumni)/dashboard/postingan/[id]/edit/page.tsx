import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditPostForm } from "@/app/(alumni)/dashboard/postingan/[id]/edit/EditPostForm";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getOwnPostById } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Postingan",
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const post = await getOwnPostById(session!.user.id, id);
  if (!post) notFound();

  return (
    <div className="container max-w-3xl py-8">
      <CatalogPageHeader title="Edit Postingan" description="Perbarui caption, tambahkan foto, atau lepas foto yang tidak diperlukan." tint="salmon" />
      <Card>
        <CardContent>
          <EditPostForm postId={post.id} caption={post.caption} images={post.images} />
        </CardContent>
      </Card>
    </div>
  );
}
