import { getDateInfo } from "./dateUtils";

const t = getDateInfo();

console.log("Now:", t.now);
console.log("Date:", t.date);
console.log("Weekday:", t.weekday);
console.log("Week Start:", t.weekStart);
console.log("Week End:", t.weekEnd);
console.log("ISO Timestamp:", t.isoTimestamp);
console.log("Month Start:", t.monthStart);
console.log("Month End:", t.monthEnd);
console.log("Year Start:", t.yearStart);
console.log("Year End:", t.yearEnd);

// Now: DateTime { ts: 2025-11-17T22:08:57.394+06:00, zone: Asia/Dhaka, locale: en-US }
// Date: 2025-11-17
// Weekday: 1
// Week Start: 2025-11-17
// Week End: 2025-11-23
// ISO Timestamp: 2025-11-17T22:08:57.394+06:00
// Month Start: 2025-11-01
// Month End: 2025-11-30
// Year Start: 2025-01-01
// Year End: 2025-12-31
