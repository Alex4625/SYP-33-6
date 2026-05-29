import { getCloudflareEnv } from "@/db";

const allowedFolders = new Set(["gallery", "posts", "profiles"]);

function mediaKey(parts: string[]) {
  if (
    parts.length < 2 ||
    !allowedFolders.has(parts[0]) ||
    parts.some((part) => !part || part === "." || part === ".." || !/^[a-zA-Z0-9._-]+$/.test(part))
  ) {
    return null;
  }

  return parts.join("/");
}

async function getMedia(keyParts: string[], includeBody: boolean) {
  const key = mediaKey(keyParts);
  if (!key) return new Response("Media tidak valid.", { status: 400 });

  const { R2 } = await getCloudflareEnv();
  if (!R2) return new Response("Penyimpanan media belum tersedia.", { status: 503 });

  const object = await R2.get(key);
  if (!object) return new Response("Media tidak ditemukan.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Disposition", "inline");
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(includeBody ? object.body : null, { headers });
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  return getMedia(key, true);
}

export async function HEAD(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  return getMedia(key, false);
}
