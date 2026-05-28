import type { Metadata } from "next";

import { CreatePostForm } from "@/app/(alumni)/dashboard/postingan/baru/CreatePostForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Buat Postingan",
};

export default function NewPostPage() {
  return (
    <div className="container max-w-3xl py-8">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Buat Postingan</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePostForm />
        </CardContent>
      </Card>
    </div>
  );
}
