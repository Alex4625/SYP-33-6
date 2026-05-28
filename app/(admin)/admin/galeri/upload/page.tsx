import type { Metadata } from "next";

import { GalleryUploadForm } from "@/app/(alumni)/dashboard/galeri/upload/GalleryUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Upload Galeri Admin",
};

export default function AdminUploadGalleryPage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Upload Foto Galeri</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
