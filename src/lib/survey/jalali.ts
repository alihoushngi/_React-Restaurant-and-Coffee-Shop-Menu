import { toPersianDigits } from "../menu/utils";

export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export interface JalaliParts {
  year: number;
  month: number;
  day: number;
}

export interface PersianDayOption {
  day: number;
  iso: string;
}

const jalaliFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const yearCache = new Map<number, PersianDayOption[][]>();

export const tehranTodayIso = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export const jalaliParts = (iso: string): JalaliParts => {
  const parts = jalaliFormatter.formatToParts(new Date(`${iso}T08:00:00Z`));
  const read = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value);
  };

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
};

export const jalaliLabel = (iso: string): string => {
  const parts = jalaliParts(iso);
  return `${toPersianDigits(parts.day)} ${PERSIAN_MONTHS[parts.month - 1]} ${toPersianDigits(parts.year)}`;
};

export const visitWeekdayLabel = (iso: string): string =>
  new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(
    new Date(`${iso}T12:00:00`),
  );

export const persianYearData = (year: number): PersianDayOption[][] => {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const months: PersianDayOption[][] = Array.from({ length: 12 }, () => []);
  const start = Date.UTC(year + 621, 2, 1);

  for (let index = 0; index < 400; index += 1) {
    const iso = new Date(start + index * 86_400_000).toISOString().slice(0, 10);
    const parts = jalaliParts(iso);
    if (parts.year === year) {
      months[parts.month - 1]?.push({ day: parts.day, iso });
    }
  }

  yearCache.set(year, months);
  return months;
};

export const resolvePersianDayIso = (
  year: number,
  month: number,
  day: number,
): string | null => {
  const match = persianYearData(year)[month - 1]?.find(
    (entry) => entry.day === day,
  );
  return match?.iso ?? null;
};
