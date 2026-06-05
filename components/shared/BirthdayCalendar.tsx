"use client";

import { useMemo, useState } from "react";
import { GiftIcon } from "lucide-react";

import { BirthdayBadge } from "@/components/shared/BirthdayBadge";
import { BirthdayList } from "@/components/shared/BirthdayList";
import type { BirthdayCalendarData } from "@/lib/birthdays";
import { cn } from "@/lib/utils";

const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function BirthdayCalendar({ data }: { data: BirthdayCalendarData }) {
  const initialDay = useMemo(() => {
    const today = data.days.find((day) => day.isToday);
    if (today) return today.day;
    return data.days.find((day) => day.birthdays.length > 0)?.day ?? 1;
  }, [data.days]);
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const selected = data.days.find((day) => day.day === selectedDay) ?? data.days[0];

  return (
    <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <div className="min-w-0 border border-black bg-background p-2 dark:border-border sm:p-3">
        <div className="grid grid-cols-7 border-b border-black pb-2 text-center font-sans text-[10px] font-bold uppercase text-muted-foreground dark:border-border">
          {weekdays.map((day) => (
            <span key={day} className="min-w-0">
              {day}
            </span>
          ))}
        </div>
        <div className="mt-2 grid min-w-0 grid-cols-7 gap-px sm:gap-1">
          {Array.from({ length: data.leadingBlankDays }, (_, index) => (
            <div key={`blank-${index}`} className="min-h-12 min-w-0 border border-transparent sm:min-h-20" />
          ))}
          {data.days.map((day) => {
            const active = selectedDay === day.day;
            const hasBirthday = day.birthdays.length > 0;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDay(day.day)}
                className={cn(
                  "relative flex min-h-12 min-w-0 flex-col overflow-hidden border border-black bg-muted/30 p-1 text-left transition-colors hover:bg-accent/20 sm:min-h-20 sm:p-2 dark:border-border",
                  day.isToday && "bg-accent text-black",
                  active && "outline outline-2 outline-offset-0 outline-black dark:outline-white",
                  hasBirthday && !day.isToday && "bg-[#c0d4a7]/70 text-black",
                )}
                aria-label={`${day.day} ${data.monthName}, ${day.birthdays.length} alumni ulang tahun`}
              >
                <span className="font-sans text-[11px] font-bold uppercase sm:text-sm">{day.day}</span>
                {day.isToday ? <span className="mt-1 text-[8px] font-bold uppercase leading-none sm:text-[10px]">Hari ini</span> : null}
                {hasBirthday ? (
                  <span className="mt-auto flex min-w-0 items-center justify-end gap-1 sm:justify-between">
                    <GiftIcon className="hidden size-4 sm:block" aria-hidden="true" />
                    <BirthdayBadge count={day.birthdays.length} className="px-1 text-[9px] sm:px-1.5 sm:text-[10px]" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <aside className="border border-black bg-[#b3bd95] p-4 text-black">
        <p className="font-sans text-xs font-bold uppercase">Tanggal dipilih</p>
        <h2 className="mt-1 font-display text-2xl uppercase leading-none">
          {selected?.day} {data.monthName}
        </h2>
        <div className="mt-4">
          <BirthdayList
            birthdays={selected?.birthdays ?? []}
            emptyMessage="Tidak ada alumni yang berulang tahun pada tanggal ini."
          />
        </div>
      </aside>
    </section>
  );
}
