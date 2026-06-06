export function mediaVariantUrl(url: string | null | undefined, width: number, quality = 78) {
  if (!url) return url ?? null;
  if (!url.startsWith("/media/")) return url;

  const [path, rawQuery = ""] = url.split("?");
  const params = new URLSearchParams(rawQuery);
  params.set("w", String(Math.max(32, Math.min(2000, Math.round(width)))));
  params.set("q", String(Math.max(45, Math.min(90, Math.round(quality)))));

  return `${path}?${params.toString()}`;
}
