import type { Metadata } from "next";

import { GalleryUploadForm } from "@/app/(alumni)/dashboard/galeri/upload/GalleryUploadForm";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Upload Galeri",
};

export default function UploadGalleryPage() {
  return (
    <div className="container max-w-2xl py-8">
      <CatalogPageHeader title="Upload Foto Galeri" description="Tambahkan satu foto kenangan ke galeri bersama." tint="sky" />
      <Card>
        <CardContent>
          <GalleryUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
