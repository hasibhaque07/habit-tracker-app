import { HabitEntryRow, HeatmapRow } from "@/types/dbTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export const useToggleHabitEntry = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      habitId,
      date,
      status,
    }: {
      habitId: number;
      date: string;
      status: 0 | 1 | null;
    }) => {
      const iso = DateTime.local().toISO() ?? "";

      const newStatus: 0 | 1 =
        status === 1
          ? 0 // toggle OFF
          : 1; // toggle ON (null → 1, 0 → 1)

      // -------------------------
      // 1. Update habits_entry
      // -------------------------
      const existing = await db.getFirstAsync<HabitEntryRow>(
        `SELECT id FROM habits_entry WHERE habit_id=? AND date=?`,
        [habitId, date]
      );

      if (existing) {
        await db.runAsync(
          `UPDATE habits_entry SET status=?, updated_at=? WHERE id=?`,
          [newStatus, iso, existing.id]
        );
      } else {
        await db.runAsync(
          `INSERT INTO habits_entry (habit_id, date, status, created_at) VALUES (?, ?, ?, ?)`,
          [habitId, date, newStatus, iso]
        );
      }

      // -------------------------
      // 2. Update heatmap
      // -------------------------
      const dt = DateTime.fromISO(date);
      const weekStart = dt.startOf("week").toFormat("yyyy-MM-dd");
      const weekdayIndex = dt.weekday - 1;

      const heatmapRow = await db.getFirstAsync<HeatmapRow>(
        `SELECT * FROM habit_heatmap WHERE habit_id=? AND week_start=?`,
        [habitId, weekStart]
      );

      let statuses: (0 | 1 | null)[] = Array(7).fill(null);
      if (heatmapRow?.statuses != null) {
        statuses = JSON.parse(String(heatmapRow.statuses));
      }

      statuses[weekdayIndex] = newStatus;
      const statusesStr = JSON.stringify(statuses);

      if (heatmapRow) {
        await db.runAsync(
          `UPDATE habit_heatmap SET statuses=?, updated_at=? WHERE habit_id=? AND week_start=?`,
          [statusesStr, iso, habitId, weekStart]
        );
      } else {
        await db.runAsync(
          `INSERT INTO habit_heatmap (habit_id, week_start, statuses, updated_at) VALUES (?, ?, ?, ?)`,
          [habitId, weekStart, statusesStr, iso]
        );
      }

      return { habitId, date, status };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heatmap-weekly"] });
      queryClient.invalidateQueries({ queryKey: ["heatmap-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["heatmap-overall"] });
      queryClient.invalidateQueries({ queryKey: ["habits-entries-today"] });
    },
  });

  return {
    toggleCheck: (habitId: number, date: string, status: 0 | 1 | null) =>
      mutation.mutate({ habitId, date, status }),
  };
};

// import { HabitEntryRow, HeatmapRow } from "@/types/dbTypes";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSQLiteContext } from "expo-sqlite";
// import { DateTime } from "luxon";

// export function useToggleHabitEntry() {
//     const db = useSQLiteContext();
//     const qc = useQueryClient();

//     return useMutation({
//       mutationFn: async ({
//         habitId,
//         date,
//         status,
//       }: {
//         habitId: number;
//         date: string;
//         status: 0 | 1;
//       }) => {
//         const iso = DateTime.local().toISO() ?? "";

//         // ----------------------------------
//         // 1. Update habits_entry
//         // ----------------------------------
//         const existing = await db.getFirstAsync<HabitEntryRow>(
//           `SELECT id FROM habits_entry WHERE habit_id=? AND date=?`,
//           [habitId, date]
//         );

//         if (existing) {
//           await db.runAsync(
//             `UPDATE habits_entry SET status=?, updated_at=? WHERE id=?`,
//             [status, iso, existing.id]
//           );
//         } else {
//           await db.runAsync(
//             `INSERT INTO habits_entry (habit_id, date, status, created_at) VALUES (?, ?, ?, ?)`,
//             [habitId, date, status, iso]
//           );
//         }

//         // ----------------------------------
//         // 2. Update heatmap
//         // ----------------------------------
//         const dt = DateTime.fromISO(date);
//         const weekStart = dt.startOf("week").toFormat("yyyy-MM-dd");
//         const weekdayIndex = dt.weekday - 1;

//         const heatmapRow = await db.getFirstAsync<HeatmapRow>(
//           "SELECT * FROM habit_heatmap WHERE habit_id=? AND week_start=?",
//           [habitId, weekStart]
//         );

//         let statuses: (0 | 1 | null)[];

//         if (heatmapRow?.statuses != null) {
//           const raw = String(heatmapRow.statuses); // ← convert number → string
//           statuses = JSON.parse(raw);
//         } else {
//           statuses = Array(7).fill(null);
//         }

//         statuses[weekdayIndex] = status;

//         const statusesStr = JSON.stringify(statuses);

//         if (heatmapRow) {
//           await db.runAsync(
//             `UPDATE habit_heatmap SET statuses=?, updated_at=? WHERE habit_id=? AND week_start=?`,
//             [statusesStr, iso, habitId, weekStart]
//           );
//         } else {
//           await db.runAsync(
//             `INSERT INTO habit_heatmap (habit_id, week_start, statuses, updated_at)
//              VALUES (?, ?, ?, ?)`,
//             [habitId, weekStart, statusesStr, iso]
//           );
//         }
//       },

//       // ----------------------------------
//       // Invalidate weekly/monthly/yearly
//       // ----------------------------------
//       onSuccess: () => {
//         qc.invalidateQueries({ queryKey: ["heatmap-weekly"] });
//         qc.invalidateQueries({ queryKey: ["heatmap-monthly"] });
//         qc.invalidateQueries({ queryKey: ["heatmap-overall"] });
//         //qc.invalidateQueries({ queryKey: ["habits"] });
//       },
//     });
//   }
