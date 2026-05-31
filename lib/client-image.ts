"use client";

const maxUploadBytes = 1_200_000;
const maxImageDimension = 1920;
const webpQualities = [0.82, 0.72, 0.62, 0.52];

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
    image.src = source;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Foto tidak dapat diproses.")),
      "image/webp",
      quality,
    );
  });
}

function webpName(filename: string) {
  const baseName = filename.replace(/\.[^.]+$/, "") || "foto";
  return `${baseName}.webp`;
}

export async function compressImageFile(file: File) {
  if (file.size <= maxUploadBytes) return file;

  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const scale = Math.min(1, maxImageDimension / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Foto tidak dapat diproses.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let smallestBlob: Blob | null = null;

    for (const quality of webpQualities) {
      const blob = await canvasBlob(canvas, quality);
      smallestBlob = blob;
      if (blob.size <= maxUploadBytes) break;
    }

    if (!smallestBlob || smallestBlob.size > maxUploadBytes) {
      throw new Error("Foto masih terlalu besar setelah dikompres. Pilih foto lain.");
    }

    return new File([smallestBlob], webpName(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
