import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://syp-33-6-alumni.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Alumni SYP-33-6",
    template: "%s | Alumni SYP-33-6",
  },
  description: "Ruang digital alumni SYP-33-6 untuk direktori, kenangan, dan galeri bersama.",
  applicationName: "Alumni SYP-33-6",
  keywords: ["Alumni SYP-33-6", "direktori alumni", "galeri alumni", "postingan alumni", "SYP 33 6"],
  authors: [{ name: "Alumni SYP-33-6" }],
  creator: "Alumni SYP-33-6",
  publisher: "Alumni SYP-33-6",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: appUrl,
    siteName: "Alumni SYP-33-6",
    title: "Alumni SYP-33-6",
    description: "Ruang digital alumni SYP-33-6 untuk direktori, kenangan, dan galeri bersama.",
    images: [
      {
        url: "/hero-alumni.webp",
        width: 1440,
        height: 810,
        alt: "Reuni alumni SYP-33-6",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumni SYP-33-6",
    description: "Ruang digital alumni SYP-33-6 untuk direktori, kenangan, dan galeri bersama.",
    images: ["/hero-alumni.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: "globalThis.__name ??= function(fn){return fn;};",
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
