// src/utils/dateUtils.ts
import { DateTime } from "luxon";

export type DateInfo = {
  now: DateTime; // Changed from 'any' to 'DateTime'

  // Basic date info
  date: string; // "YYYY-MM-DD"
  weekday: number; // 1–7 (Mon–Sun)
  isoTimestamp: string | null; // Changed to allow null

  // Week info
  weekStart: string; // Monday
  weekEnd: string; // Sunday

  // Month info
  monthStart: string; // 1st of month
  monthEnd: string; // last day of month

  // Year info
  yearStart: string; // Jan 01
  yearEnd: string; // Dec 31
};

export function getDateInfo(): DateInfo {
  const now = DateTime.local();

  const date = now.toFormat("yyyy-MM-dd");
  const weekday = now.weekday; // 1–7 (Mon–Sun)
  const isoTimestamp = now.toISO(); // Can be null

  // If you want Monday as week start, use startOf('week') with locale settings
  // or manually adjust. By default, Luxon uses Sunday as week start.
  const weekStart = now.startOf("week").toFormat("yyyy-MM-dd");
  const weekEnd = now.endOf("week").toFormat("yyyy-MM-dd");

  const monthStart = now.startOf("month").toFormat("yyyy-MM-dd");
  const monthEnd = now.endOf("month").toFormat("yyyy-MM-dd");

  const yearStart = now.startOf("year").toFormat("yyyy-MM-dd");
  const yearEnd = now.endOf("year").toFormat("yyyy-MM-dd");

  return {
    now,
    date,
    weekday,
    isoTimestamp: isoTimestamp ?? "", // Handle null case, or keep as null
    weekStart,
    weekEnd,
    monthStart,
    monthEnd,
    yearStart,
    yearEnd,
  };
}

// how to use it
// import { getDateInfo } from "@/utils/dateUtils";

// const t = getDateInfo();

// console.log(t.date);        // "2025-11-17"
// console.log(t.weekday);     // 1–7
// console.log(t.weekStart);   // "2025-11-17" (Monday)
// console.log(t.weekEnd);     // "2025-11-23" (Sunday)
// console.log(t.isoTimestamp);
