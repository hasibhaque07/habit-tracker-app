// React Query + SQLite + Luxon heatmap hooks implementation
// This file contains:
// - useHeatmapWeekly
// - useHeatmapMonthly
// - useHeatmapOverall
// - useToggleHabitEntry

import { getDateInfo } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

// Utility: Parse SQL JSON array result
function parseEntries(rows: any[]) {
  return rows.map((row) => ({
    ...row,
    entries: JSON.parse(row.entries || "[]"),
  }));
}

// --------------------------------------------------
// Core SQL builder
// --------------------------------------------------
// const HEATMAP_QUERY = `
// SELECT
//   h.*,
//   COALESCE(
//     json_group_array(
//       json_object(
//         'week_start', hh.week_start,
//         'statuses', hh.statuses
//       )
//       ORDER BY hh.week_start ASC
//     ), '[]'
//   ) AS entries
// FROM habits h
// LEFT JOIN habit_heatmap hh
//   ON hh.habit_id = h.id
//   AND hh.week_start BETWEEN ? AND ?
// WHERE h.active = 1
// GROUP BY h.id
// ORDER BY h."order" ASC;
// `;

const HEATMAP_QUERY = `
SELECT 
  h.*,
  hh.week_start,
  hh.statuses
FROM habits h
LEFT JOIN habit_heatmap hh
  ON hh.habit_id = h.id
  AND hh.week_start BETWEEN ? AND ?
WHERE h.active = 1
ORDER BY h."order" ASC, hh.week_start ASC;
`;

// --------------------------------------------------
// Monthly Hook
// Aligns weeks using monthStart → monthEnd
// --------------------------------------------------
export function useHeatmapMonthly() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: ["heatmap-monthly"],
    queryFn: async () => {
      const t = getDateInfo();

      const monthStartWeek = DateTime.fromISO(t.monthStart)
        .startOf("week")
        .toFormat("yyyy-MM-dd");
      const monthEndWeek = DateTime.fromISO(t.monthEnd)
        .endOf("week")
        .toFormat("yyyy-MM-dd");

      const rows = await db.getAllAsync(HEATMAP_QUERY, [
        monthStartWeek,
        monthEndWeek,
      ]);
      return parseEntries(rows);
    },
  });
}

// --------------------------------------------------
// Overall Hook (Yearly)
// --------------------------------------------------
export function useHeatmapOverall() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: ["heatmap-overall"],
    queryFn: async () => {
      const t = getDateInfo();

      const yearStartWeek = DateTime.fromISO(t.yearStart)
        .startOf("week")
        .toFormat("yyyy-MM-dd");
      const yearEndWeek = DateTime.fromISO(t.yearEnd)
        .endOf("week")
        .toFormat("yyyy-MM-dd");

      const rows = await db.getAllAsync(HEATMAP_QUERY, [
        yearStartWeek,
        yearEndWeek,
      ]);
      return parseEntries(rows);
    },
  });
}
