import type { Metadata } from "next";

import { CreatePostForm } from "@/app/(alumni)/dashboard/postingan/baru/CreatePostForm";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Buat Postingan",
};

export default function NewPostPage() {
  return (
    <div className="container max-w-3xl py-8">
      <CatalogPageHeader title="Buat Postingan" description="Bagikan cerita dan hingga empat foto kepada komunitas alumni." tint="salmon" />
      <Card>
        <CardContent>
          <CreatePostForm />
        </CardContent>
      </Card>
    </div>
  );
}
