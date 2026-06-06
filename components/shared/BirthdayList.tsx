import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon, UserRoundIcon } from "lucide-react";

import type { SafeBirthdayAlumni } from "@/lib/birthdays";
import { buttonVariants } from "@/components/ui/button";
import { mediaVariantUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export function BirthdayList({
  birthdays,
  emptyMessage = "Belum ada alumni yang berulang tahun pada tanggal ini.",
}: {
  birthdays: SafeBirthdayAlumni[];
  emptyMessage?: string;
}) {
  if (!birthdays.length) {
    return (
      <div className="border border-black bg-background p-4 text-sm text-muted-foreground dark:border-border">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {birthdays.map((alumni) => {
        const profilePhoto = mediaVariantUrl(alumni.profilePhotoUrl, 160, 76);

        return (
        <article key={`${alumni.username}-${alumni.birthDay}-${alumni.birthMonth}`} className="border border-black bg-background p-3 dark:border-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-black bg-muted dark:border-border">
              {profilePhoto ? (
                <Image src={profilePhoto} alt={alumni.fullName} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <UserRoundIcon className="size-7" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="break-words font-sans text-sm font-bold uppercase">{alumni.fullName}</h3>
              <p className="text-xs text-muted-foreground">@{alumni.username}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="border border-black bg-[#c0d4a7] px-2 py-1 font-sans font-bold uppercase text-black">{alumni.highSchoolMajor}</span>
                <span className="border border-black bg-muted px-2 py-1">{alumni.collegeMajor}</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm">
                <CalendarDaysIcon className="size-4 text-accent" aria-hidden="true" />
                Ulang tahun: {alumni.birthLabel}
              </p>
            </div>
            <Link
              href={`/alumni/${alumni.username}`}
              prefetch={false}
              className={cn(buttonVariants({ variant: "outline" }), "sm:self-center")}
            >
              Lihat Profil
            </Link>
          </div>
        </article>
        );
      })}
    </div>
  );
}
