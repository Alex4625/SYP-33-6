import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusinessIcon, CalendarIcon, LinkIcon, MapPinIcon, UserRoundIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PostCard } from "@/components/shared/PostCard";
import { getPublicAlumniProfile } from "@/lib/data";
import { formatDate } from "@/lib/format";

type Params = { username: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  const alumni = await getPublicAlumniProfile(username);

  return { title: alumni ? alumni.fullName : "Profil Alumni" };
}

function socialLinks(value: unknown): { platform: string; url: string }[] {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value || "[]");
    } catch {
      parsed = [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is { platform: string; url: string } => {
    return typeof item === "object" && item !== null && "platform" in item && "url" in item;
  });
}

export default async function AlumniProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  const alumni = await getPublicAlumniProfile(username);

  if (!alumni) notFound();

  const domicile = [alumni.domicileCity, alumni.domicileProvince].filter(Boolean).join(", ");
  const origin = [alumni.originCity, alumni.originProvince].filter(Boolean).join(", ");
  const links = socialLinks(alumni.socialMedia);

  return (
    <div className="container py-10">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-6 md:grid-cols-[220px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-full border bg-muted">
            {alumni.profilePhotoUrl ? (
              <Image src={alumni.profilePhotoUrl} alt={alumni.fullName} fill className="object-cover" sizes="220px" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <UserRoundIcon className="size-16" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl uppercase leading-none">{alumni.fullName}</h1>
              <Badge variant="secondary">{alumni.highSchoolMajor}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <BriefcaseBusinessIcon className="size-4" aria-hidden="true" />
              {alumni.collegeMajor}
            </p>
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
              <p className="flex items-center gap-2"><CalendarIcon className="size-4 text-primary" /> {alumni.birthPlace}, {formatDate(alumni.birthDate)}</p>
              {domicile ? <p className="flex items-center gap-2"><MapPinIcon className="size-4 text-primary" /> Domisili: {domicile}</p> : null}
              {origin ? <p className="flex items-center gap-2"><MapPinIcon className="size-4 text-primary" /> Asal: {origin}</p> : null}
            </div>
            {alumni.bio ? <p className="mt-5 whitespace-pre-line leading-7 text-muted-foreground">{alumni.bio}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {alumni.linkedinUrl ? <Link href={alumni.linkedinUrl} className="inline-flex items-center gap-1 text-primary hover:underline"><LinkIcon className="size-4" /> LinkedIn</Link> : null}
              {alumni.portfolioUrl ? <Link href={alumni.portfolioUrl} className="inline-flex items-center gap-1 text-primary hover:underline"><LinkIcon className="size-4" /> Portofolio</Link> : null}
              {links.map((link) => (
                <Link key={`${link.platform}-${link.url}`} href={link.url} className="inline-flex items-center gap-1 text-primary hover:underline">
                  <LinkIcon className="size-4" />
                  {link.platform}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mt-10">
        <div className="border border-black bg-[#d77a7a] p-3 text-black">
          <h2 className="font-display text-2xl uppercase leading-none">Postingan Alumni</h2>
        </div>
        {alumni.user.posts.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {alumni.user.posts.map((post) => <PostCard key={post.id} post={post} compact />)}
          </div>
        ) : (
          <EmptyState className="mt-5" title="Belum ada postingan" description="Alumni ini belum membuat postingan publik." />
        )}
      </section>
    </div>
  );
}
