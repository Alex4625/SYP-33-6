import { getCloudflareEnv } from "@/db";

export function mediaUrlFor(key: string) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/media/${encodedKey}`;
}

export function proxiedMediaUrl(url: string | null) {
  if (!url || url.startsWith("/media/")) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".r2.dev")) {
      return mediaUrlFor(decodeURIComponent(parsed.pathname.replace(/^\/+/, "")));
    }
  } catch {
    return url;
  }

  return url;
}

export async function uploadToR2(body: ArrayBuffer | Uint8Array, key: string, contentType: string) {
  const env = await getCloudflareEnv();

  if (!env.R2) {
    throw new Error("Binding R2 belum tersedia.");
  }

  await env.R2.put(key, body, {
    httpMetadata: {
      contentType,
    },
  });

  return mediaUrlFor(key);
}

export async function deleteFromR2(key: string) {
  const env = await getCloudflareEnv();

  if (!env.R2) {
    throw new Error("Binding R2 belum tersedia.");
  }

  await env.R2.delete(key);
}

export function generateR2Key(folder: string, filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `${folder}/${crypto.randomUUID()}.${ext}`;
}
