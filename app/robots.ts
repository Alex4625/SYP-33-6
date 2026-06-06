import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://syp-33-6-alumni.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/alumni", "/postingan", "/galeri", "/kalender"],
      disallow: ["/admin", "/dashboard", "/api"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
