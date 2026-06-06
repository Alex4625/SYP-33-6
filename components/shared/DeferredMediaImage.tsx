"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const BLANK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export function DeferredMediaImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || activeSrc) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "180px 0px" },
    );

    observer.observe(image);
    return () => observer.disconnect();
  }, [activeSrc, src]);

  return (
    // This preview intentionally delays assigning the remote R2 URL until near-viewport.
    // next/image cannot defer the network request this aggressively with unoptimized images.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      src={activeSrc ?? BLANK_IMAGE}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("transition-opacity duration-300", activeSrc ? "opacity-100" : "opacity-0", className)}
    />
  );
}
