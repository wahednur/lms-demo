import type { Weekday } from "@/types";

/** JS `Date#getDay()` (0=Sunday..6=Saturday) mapped onto our Weekday union. */
export const WEEKDAY_BY_JS_DAY: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * Accepts a "YYYY-MM-DD" string or a Date. String input is parsed as a
 * LOCAL calendar date (manual y/m/d construction), not via `new Date(str)`
 * — the latter parses date-only ISO strings as UTC midnight, which can
 * shift the resulting weekday by a day depending on the runtime's timezone.
 */
export function weekdayOf(date: Date | string): Weekday {
  if (typeof date === "string") {
    const [y, m, d] = date.split("-").map(Number);
    return WEEKDAY_BY_JS_DAY[new Date(y, m - 1, d).getDay()];
  }
  return WEEKDAY_BY_JS_DAY[date.getDay()];
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayWeekday(): Weekday {
  return WEEKDAY_BY_JS_DAY[new Date().getDay()];
}
