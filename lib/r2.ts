import { getCloudflareEnv } from "@/db";

function publicUrlFor(key: string, publicBaseUrl?: string) {
  const baseUrl = publicBaseUrl ?? process.env.R2_PUBLIC_URL;

  if (!baseUrl) {
    throw new Error("R2_PUBLIC_URL belum dikonfigurasi.");
  }

  return `${baseUrl.replace(/\/$/, "")}/${key}`;
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

  return publicUrlFor(key, env.R2_PUBLIC_URL);
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
