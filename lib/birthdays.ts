import { and, asc, eq, isNotNull, ne } from "drizzle-orm";
import { cache } from "react";

import { getCloudflareDb, type Database } from "@/db";
import { alumniProfiles, users, type HighSchoolMajor } from "@/db/schema";
import {
  birthdayMonthNames,
  daysInMonth,
  formatBirthdayLabel,
  getCurrentDateParts,
  mondayFirstOffset,
  parseBirthDateParts,
  type MonthNumber,
} from "@/lib/birthday-utils";
import { proxiedMediaUrl } from "@/lib/r2";

export type SafeBirthdayAlumni = {
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl: string | null;
  highSchoolMajor: HighSchoolMajor;
  collegeMajor: string;
  birthDay: number;
  birthMonth: MonthNumber;
  birthLabel: string;
};

export type BirthdayCalendarDay = {
  day: number;
  dateKey: string;
  isToday: boolean;
  birthdays: SafeBirthdayAlumni[];
};

export type BirthdayCalendarData = {
  year: number;
  month: MonthNumber;
  monthName: string;
  leadingBlankDays: number;
  days: BirthdayCalendarDay[];
  todayBirthdays: SafeBirthdayAlumni[];
  birthdaysThisMonth: SafeBirthdayAlumni[];
  upcomingBirthdays: SafeBirthdayAlumni[];
};

type BirthdayRow = {
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl: string | null;
  highSchoolMajor: HighSchoolMajor;
  collegeMajor: string;
  birthDate: string;
};

function safeBirthday(row: BirthdayRow): SafeBirthdayAlumni | null {
  const parts = parseBirthDateParts(row.birthDate);
  if (!parts) return null;

  return {
    userId: row.userId,
    username: row.username,
    fullName: row.fullName,
    profilePhotoUrl: proxiedMediaUrl(row.profilePhotoUrl),
    highSchoolMajor: row.highSchoolMajor,
    collegeMajor: row.collegeMajor,
    birthDay: parts.day,
    birthMonth: parts.month,
    birthLabel: formatBirthdayLabel(parts.day, parts.month),
  };
}

async function getApprovedBirthdayRowsUncached(database?: Database) {
  const db = database ?? await getCloudflareDb();

  const rows = await db
    .select({
      userId: users.id,
      username: users.username,
      fullName: alumniProfiles.fullName,
      profilePhotoUrl: alumniProfiles.profilePhotoUrl,
      highSchoolMajor: alumniProfiles.highSchoolMajor,
      collegeMajor: alumniProfiles.collegeMajor,
      birthDate: alumniProfiles.birthDate,
    })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(
      and(
        eq(users.role, "ALUMNI"),
        eq(users.status, "APPROVED"),
        isNotNull(alumniProfiles.birthDate),
        ne(alumniProfiles.birthDate, ""),
      ),
    )
    .orderBy(asc(alumniProfiles.fullName));

  return rows.flatMap((row) => {
    const birthday = safeBirthday(row);
    return birthday ? [birthday] : [];
  });
}

const getApprovedBirthdayRowsCached = cache(async () => getApprovedBirthdayRowsUncached());

async function getApprovedBirthdayRows(database?: Database) {
  return database ? getApprovedBirthdayRowsUncached(database) : getApprovedBirthdayRowsCached();
}

export async function getTodayBirthdays(database?: Database) {
  const today = getCurrentDateParts();
  const birthdays = await getApprovedBirthdayRows(database);
  return birthdays
    .filter((alumni) => alumni.birthMonth === today.month && alumni.birthDay === today.day)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getBirthdaysByMonth(month: number, database?: Database) {
  const birthdays = await getApprovedBirthdayRows(database);
  return birthdays
    .filter((alumni) => alumni.birthMonth === month)
    .sort((a, b) => a.birthDay - b.birthDay || a.fullName.localeCompare(b.fullName));
}

function upcomingFromBirthdays(birthdays: SafeBirthdayAlumni[], limit: number) {
  const today = getCurrentDateParts();
  const todayTime = Date.UTC(today.year, today.month - 1, today.day);

  return birthdays
    .map((alumni) => {
      let nextDate = Date.UTC(today.year, alumni.birthMonth - 1, alumni.birthDay);
      if (nextDate < todayTime) {
        nextDate = Date.UTC(today.year + 1, alumni.birthMonth - 1, alumni.birthDay);
      }
      return { alumni, distance: nextDate - todayTime };
    })
    .sort((a, b) => a.distance - b.distance || a.alumni.fullName.localeCompare(b.alumni.fullName))
    .slice(0, limit)
    .map((item) => item.alumni);
}

export async function getUpcomingBirthdays(limit = 5, database?: Database) {
  const birthdays = await getApprovedBirthdayRows(database);
  return upcomingFromBirthdays(birthdays, limit);
}

export async function getBirthdayCalendarData(month?: number, year?: number): Promise<BirthdayCalendarData> {
  const today = getCurrentDateParts();
  const selectedMonth = month && month >= 1 && month <= 12 ? (month as MonthNumber) : today.month;
  const selectedYear = year && year >= 1970 && year <= 2100 ? year : today.year;
  const birthdays = await getApprovedBirthdayRows();
  const monthBirthdays = birthdays
    .filter((alumni) => alumni.birthMonth === selectedMonth)
    .sort((a, b) => a.birthDay - b.birthDay || a.fullName.localeCompare(b.fullName));
  const todayBirthdays = birthdays
    .filter((alumni) => alumni.birthMonth === today.month && alumni.birthDay === today.day)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
  const currentMonthBirthdays = birthdays
    .filter((alumni) => alumni.birthMonth === today.month)
    .sort((a, b) => a.birthDay - b.birthDay || a.fullName.localeCompare(b.fullName));
  const daysTotal = daysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysTotal }, (_, index) => {
    const day = index + 1;
    const dayBirthdays = monthBirthdays.filter((alumni) => alumni.birthDay === day);

    return {
      day,
      dateKey: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      isToday: selectedYear === today.year && selectedMonth === today.month && day === today.day,
      birthdays: dayBirthdays,
    };
  });

  return {
    year: selectedYear,
    month: selectedMonth,
    monthName: birthdayMonthNames[selectedMonth - 1],
    leadingBlankDays: mondayFirstOffset(selectedYear, selectedMonth),
    days,
    todayBirthdays,
    birthdaysThisMonth: currentMonthBirthdays,
    upcomingBirthdays: upcomingFromBirthdays(birthdays, 5),
  };
}
