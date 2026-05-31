import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditPostForm } from "@/app/(alumni)/dashboard/postingan/[id]/edit/EditPostForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Edit Postingan</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPostForm postId={post.id} caption={post.caption} images={post.images} />
        </CardContent>
      </Card>
    </div>
  );
}
