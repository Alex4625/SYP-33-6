import { getCloudflareEnv } from "@/db";

const allowedFolders = new Set(["gallery", "posts", "profiles"]);

type ImageFetchInit = RequestInit & {
  cf?: {
    image?: {
      fit?: "scale-down";
      format?: "webp";
      quality?: number;
      width?: number;
    };
  };
};

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

function imageVariantFromRequest(request: Request) {
  const params = new URL(request.url).searchParams;
  const widthValue = Number(params.get("w") ?? params.get("width"));
  if (!Number.isFinite(widthValue) || widthValue <= 0) return null;

  const qualityValue = Number(params.get("q") ?? params.get("quality") ?? 78);
  const width = Math.max(32, Math.min(2000, Math.round(widthValue)));
  const quality = Math.max(45, Math.min(90, Math.round(Number.isFinite(qualityValue) ? qualityValue : 78)));

  return { quality, width };
}

async function getMedia(keyParts: string[], includeBody: boolean, request?: Request) {
  const key = mediaKey(keyParts);
  if (!key) return new Response("Media tidak valid.", { status: 400 });

  const variant = includeBody && request ? imageVariantFromRequest(request) : null;
  if (variant && request) {
    try {
      const sourceUrl = new URL(request.url);
      sourceUrl.search = "";

      const resized = await fetch(sourceUrl.toString(), {
        cf: {
          image: {
            fit: "scale-down",
            format: "webp",
            quality: variant.quality,
            width: variant.width,
          },
        },
        headers: {
          Accept: request.headers.get("Accept") ?? "image/webp,image/*,*/*",
        },
      } satisfies ImageFetchInit);

      if (resized.ok && resized.body) {
        const headers = new Headers(resized.headers);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Content-Disposition", "inline");
        headers.set("Vary", "Accept");
        headers.set("X-Content-Type-Options", "nosniff");

        return new Response(resized.body, {
          headers,
          status: resized.status,
          statusText: resized.statusText,
        });
      }
    } catch {
      // Jika image resizing Cloudflare tidak tersedia, lanjutkan dengan file asli.
    }
  }

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

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  return getMedia(key, true, request);
}

export async function HEAD(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  return getMedia(key, false);
}
