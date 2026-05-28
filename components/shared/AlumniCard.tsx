import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, UserRoundIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HighSchoolMajor } from "@prisma/client";

export type AlumniCardData = {
  fullName: string;
  highSchoolMajor: HighSchoolMajor;
  collegeMajor: string;
  domicileCity?: string | null;
  domicileProvince?: string | null;
  profilePhotoUrl?: string | null;
  user: {
    username: string;
  };
};

export function AlumniCard({ alumni }: { alumni: AlumniCardData }) {
  const domicile = [alumni.domicileCity, alumni.domicileProvince].filter(Boolean).join(", ");

  return (
    <Card className="overflow-hidden rounded-lg border-border/80 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {alumni.profilePhotoUrl ? (
              <Image src={alumni.profilePhotoUrl} alt={alumni.fullName} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <UserRoundIcon className="size-8" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="line-clamp-1 font-semibold">{alumni.fullName}</h3>
              <Badge variant="secondary">{alumni.highSchoolMajor}</Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{alumni.collegeMajor}</p>
            {domicile ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="size-3.5" aria-hidden="true" />
                {domicile}
              </p>
            ) : null}
          </div>
        </div>
        <Link
          href={`/alumni/${alumni.user.username}`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
        >
          Lihat Profil
        </Link>
      </CardContent>
    </Card>
  );
}
