import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type CloudinaryUploadResult = {
  imageUrl: string;
  imagePublicId: string;
};

/**
 * Upload buffer gambar ke Cloudinary pada folder yang diberikan.
 */
export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  publicId?: string,
): Promise<CloudinaryUploadResult> {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: Boolean(publicId),
      },
      (error, response) => {
        if (error || !response) {
          reject(error ?? new Error("Upload Cloudinary gagal"));
          return;
        }

        resolve(response);
      },
    );

    upload.end(file);
  });

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  };
}

/**
 * Hapus asset Cloudinary berdasarkan public id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
