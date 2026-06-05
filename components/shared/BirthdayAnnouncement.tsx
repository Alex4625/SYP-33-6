import Link from "next/link";
import { GiftIcon } from "lucide-react";

import type { SafeBirthdayAlumni } from "@/lib/birthdays";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BirthdayAnnouncement({
  birthdays,
  className,
}: {
  birthdays: SafeBirthdayAlumni[];
  className?: string;
}) {
  if (!birthdays.length) return null;

  const message =
    birthdays.length === 1
      ? `Hari ini ${birthdays[0].fullName} sedang berulang tahun 🎉`
      : `Hari ini ada ${birthdays.length} alumni yang berulang tahun 🎉`;

  return (
    <section className={cn("border border-black bg-[#fcc20f] p-4 text-black", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="catalog-bevel flex size-10 shrink-0 items-center justify-center border border-black bg-black text-white">
            <GiftIcon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-sans text-xs font-bold uppercase">Pengumuman ulang tahun</p>
            <p className="mt-1 font-display text-xl uppercase leading-none">{message}</p>
          </div>
        </div>
        <Link href="/kalender" prefetch={false} className={cn(buttonVariants({ variant: "outline" }), "border-black bg-[#fcc20f] text-black hover:bg-black hover:text-white")}>
          Lihat Kalender
        </Link>
      </div>
    </section>
  );
}
