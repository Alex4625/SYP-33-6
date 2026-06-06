"use client";

import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { CameraIcon, UserRoundIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const maxProfileSourceSize = 5 * 1024 * 1024;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
    image.src = src;
  });
}

async function cropToSquare(source: string, crop: Area, filename: string) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Foto tidak dapat diproses.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = "blur(0.1px) saturate(1.02) contrast(1.01)";
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Foto tidak dapat diproses.")), "image/webp", 0.82);
  });

  const baseName = filename.replace(/\.[^.]+$/, "") || "foto-profil";
  return new File([blob], `${baseName}-profil.webp`, { type: "image/webp" });
}

export function ProfilePhotoCropper({
  currentPhotoUrl,
  onChange,
}: {
  currentPhotoUrl?: string | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const ownedSourceUrl = useRef("");
  const ownedPreviewUrl = useRef("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("foto-profil.jpg");
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl ?? "");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => () => {
    if (ownedSourceUrl.current) URL.revokeObjectURL(ownedSourceUrl.current);
    if (ownedPreviewUrl.current) URL.revokeObjectURL(ownedPreviewUrl.current);
  }, []);

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!allowedTypes.has(file.type)) {
      setError("Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.");
      return;
    }

    if (file.size > maxProfileSourceSize) {
      setError("Ukuran foto profil melebihi batas 5 MB. Pilih file yang lebih kecil.");
      return;
    }

    if (ownedSourceUrl.current) URL.revokeObjectURL(ownedSourceUrl.current);
    const nextSourceUrl = URL.createObjectURL(file);
    ownedSourceUrl.current = nextSourceUrl;
    setSourceUrl(nextSourceUrl);
    setSourceName(file.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError("");
    setDialogOpen(true);
  }

  async function applyCrop() {
    if (!sourceUrl || !croppedArea) return;
    setProcessing(true);
    setError("");

    try {
      const file = await cropToSquare(sourceUrl, croppedArea, sourceName);
      if (ownedPreviewUrl.current) URL.revokeObjectURL(ownedPreviewUrl.current);
      const nextPreviewUrl = URL.createObjectURL(file);
      ownedPreviewUrl.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      onChange(file);
      setDialogOpen(false);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Foto tidak dapat diproses.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border border-black bg-muted/20 p-4 dark:border-border">
      <div className="relative size-28 shrink-0 overflow-hidden rounded-full border bg-muted sm:size-32">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Pratinjau foto profil"
            fill
            unoptimized={previewUrl.startsWith("blob:")}
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <UserRoundIcon className="size-12" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-xs font-bold uppercase">Foto profil</p>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Pilih foto lalu atur posisi dan pembesarannya. Foto akan dihaluskan dan disimpan ringan sesuai potongan yang Anda lihat.
        </p>
        <Button type="button" variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}>
          <CameraIcon className="size-4" aria-hidden="true" />
          {previewUrl ? "Ubah Foto" : "Pilih Foto"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={choosePhoto}
        />
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Sesuaikan Foto Profil</DialogTitle>
            <DialogDescription>Geser foto dan gunakan slider sampai komposisinya sesuai.</DialogDescription>
          </DialogHeader>
          <div className="relative h-[min(60vh,28rem)] overflow-hidden border border-black bg-black dark:border-border">
            {sourceUrl ? (
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedArea(pixels)}
              />
            ) : null}
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-sans text-xs font-bold uppercase">Perbesar foto</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-primary"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button type="button" onClick={applyCrop} disabled={!croppedArea || processing}>
              {processing ? "Memproses..." : "Gunakan Foto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
