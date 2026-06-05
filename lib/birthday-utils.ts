export const birthdayMonthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type DateParts = {
  year: number;
  month: MonthNumber;
  day: number;
};

export function parseBirthDateParts(value: string | null | undefined): DateParts | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return { year, month: month as MonthNumber, day };
}

export function formatBirthdayLabel(day: number, month: number) {
  const monthName = birthdayMonthNames[month - 1] ?? "";
  return `${day} ${monthName}`.trim();
}

export function getCurrentDateParts(timeZone = "Asia/Makassar"): DateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(value.year),
    month: Number(value.month) as MonthNumber,
    day: Number(value.day),
  };
}

export function clampMonth(value: number | string | string[] | undefined, fallback: MonthNumber): MonthNumber {
  const raw = Array.isArray(value) ? value[0] : value;
  const month = Number(raw);
  if (Number.isInteger(month) && month >= 1 && month <= 12) return month as MonthNumber;
  return fallback;
}

export function clampCalendarYear(value: number | string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const year = Number(raw);
  if (Number.isInteger(year) && year >= 1970 && year <= 2100) return year;
  return fallback;
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function mondayFirstOffset(year: number, month: number) {
  const sundayFirst = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (sundayFirst + 6) % 7;
}

export function nextMonthParams(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 as MonthNumber };
  return { year, month: (month + 1) as MonthNumber };
}

export function previousMonthParams(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 as MonthNumber };
  return { year, month: (month - 1) as MonthNumber };
}
