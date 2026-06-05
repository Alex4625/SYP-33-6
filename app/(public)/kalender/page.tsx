import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { BirthdayAnnouncement } from "@/components/shared/BirthdayAnnouncement";
import { BirthdayCalendar } from "@/components/shared/BirthdayCalendar";
import { BirthdayList } from "@/components/shared/BirthdayList";
import { CatalogPageHeader } from "@/components/shared/CatalogPageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { clampCalendarYear, clampMonth, getCurrentDateParts, nextMonthParams, previousMonthParams } from "@/lib/birthday-utils";
import { getBirthdayCalendarData } from "@/lib/birthdays";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kalender Ulang Tahun Alumni",
};

type SearchParams = Record<string, string | string[] | undefined>;

function calendarHref(month: number, year: number) {
  return `/kalender?bulan=${month}&tahun=${year}`;
}

export default async function BirthdayCalendarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const today = getCurrentDateParts();
  const month = clampMonth(params.bulan, today.month);
  const year = clampCalendarYear(params.tahun, today.year);
  const data = await getBirthdayCalendarData(month, year);
  const previous = previousMonthParams(data.year, data.month);
  const next = nextMonthParams(data.year, data.month);

  return (
    <div className="container py-10">
      <CatalogPageHeader
        eyebrow="Kalender komunitas"
        title="Kalender Ulang Tahun Alumni"
        description="Lihat jadwal ulang tahun alumni berdasarkan tanggal dan bulan."
        tint="lime"
      />

      <BirthdayAnnouncement birthdays={data.todayBirthdays} className="mb-6" />

      <div className="mb-4 flex flex-col gap-3 border border-black bg-background p-3 sm:flex-row sm:items-center sm:justify-between dark:border-border">
        <Link href={calendarHref(previous.month, previous.year)} prefetch={false} className={cn(buttonVariants({ variant: "outline" }), "justify-center")}>
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          Bulan Sebelumnya
        </Link>
        <div className="text-center">
          <p className="font-sans text-xs font-bold uppercase text-muted-foreground">Tampilan bulan</p>
          <h2 className="font-display text-2xl uppercase leading-none">{data.monthName} {data.year}</h2>
        </div>
        <Link href={calendarHref(next.month, next.year)} prefetch={false} className={cn(buttonVariants({ variant: "outline" }), "justify-center")}>
          Bulan Berikutnya
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <BirthdayCalendar data={data} />

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 border border-black bg-[#9ab6c8] p-4 text-black">
            <p className="font-sans text-xs font-bold uppercase">Bulan ini</p>
            <h2 className="mt-1 font-display text-2xl uppercase leading-none">Ulang Tahun Bulan Ini</h2>
          </div>
          {data.birthdaysThisMonth.length ? (
            <BirthdayList birthdays={data.birthdaysThisMonth} />
          ) : (
            <EmptyState title="Belum ada alumni yang berulang tahun bulan ini." description="Data akan muncul saat ada alumni approved dengan tanggal lahir pada bulan ini." />
          )}
        </div>

        <div>
          <div className="mb-4 border border-black bg-[#d77a7a] p-4 text-black">
            <p className="font-sans text-xs font-bold uppercase">Berikutnya</p>
            <h2 className="mt-1 font-display text-2xl uppercase leading-none">Ulang Tahun Mendatang</h2>
          </div>
          {data.upcomingBirthdays.length ? (
            <BirthdayList birthdays={data.upcomingBirthdays} />
          ) : (
            <EmptyState title="Belum ada ulang tahun mendatang." description="Data ulang tahun alumni aktif belum tersedia." />
          )}
        </div>
      </section>
    </div>
  );
}
