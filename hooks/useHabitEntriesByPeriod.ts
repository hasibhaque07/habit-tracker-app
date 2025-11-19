// hooks/useHabitEntriesByPeriod.ts
import { Habit } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";

export type HabitWithEntry = Habit & {
  entry_status: 0 | 1 | null; // null if no entry exists
  entry_date: string | null;
};

export type HabitWithWeeklyEntries = Habit & {
  entries: {
    date: string;
    status: 0 | 1 | null;
  }[];
};

export type HabitWithMonthlyEntries = Habit & {
  entries: {
    date: string;
    status: 0 | 1 | null;
  }[];
};

export const useHabitEntriesByPeriod = (
  period: "today" | "weekly" | "monthly" | "overall"
) => {
  const db = useSQLiteContext();
  const dateInfo = getDateInfo();

  // Helper to ensure today's entries exist (for midnight reset)
  const ensureTodayEntries = async (habits: Habit[]) => {
    const today = dateInfo.date;
    const now = DateTime.local().toISO() ?? "";

    for (const habit of habits) {
      const existing = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM habits_entry WHERE habit_id = ? AND date = ?",
        [habit.id, today]
      );

      if (!existing) {
        // Create entry with status 0 (unchecked) for new day
        await db.runAsync(
          "INSERT INTO habits_entry (habit_id, date, status, created_at) VALUES (?, ?, 0, ?)",
          [habit.id, today, now]
        );
      }
    }
  };

  // TODAY view - single entry per habit for today
  const todayQuery = useQuery<HabitWithEntry[]>({
    queryKey: ["habits-entries-today", dateInfo.date],
    queryFn: async () => {
      // First get all active habits
      const habits = await db.getAllAsync<Habit>(
        'SELECT * FROM habits WHERE active = 1 ORDER BY "order" ASC, id DESC'
      );

      // Ensure today's entries exist (midnight reset logic)
      await ensureTodayEntries(habits);

      // Fetch habits with today's entry status
      // Use a subquery to get the latest entry status for each habit
      const results = await db.getAllAsync<HabitWithEntry>(
        `
        SELECT 
          h.*,
          (SELECT he.status FROM habits_entry he 
           WHERE he.habit_id = h.id AND he.date = ? 
           ORDER BY he.updated_at DESC, he.created_at DESC 
           LIMIT 1) as entry_status,
          ? as entry_date
        FROM habits h
        WHERE h.active = 1
        ORDER BY h."order" ASC, h.id DESC
        `,
        [dateInfo.date, dateInfo.date]
      );

      // Map and ensure proper types
      const mapped = results.map((r) => ({
        ...r,
        entry_status: r.entry_status ?? null,
        entry_date: r.entry_date ?? null,
      }));

      // Final deduplication by habit ID (safety net)
      const habitMap = new Map<number, HabitWithEntry>();
      mapped.forEach((habit) => {
        if (!habitMap.has(habit.id)) {
          habitMap.set(habit.id, habit);
        }
      });

      return Array.from(habitMap.values());
    },
  });

  // WEEKLY view - entries for each day of the week
  const weeklyQuery = useQuery<HabitWithWeeklyEntries[]>({
    queryKey: ["habits-entries-weekly", dateInfo.weekStart, dateInfo.weekEnd],
    queryFn: async () => {
      // Get all active habits
      const habits = await db.getAllAsync<Habit>(
        'SELECT * FROM habits WHERE active = 1 ORDER BY "order" ASC, id DESC'
      );

      // Ensure today's entries exist
      await ensureTodayEntries(habits);

      // Generate all dates in the week (Mon-Sun)
      const weekDates: string[] = [];
      const start = DateTime.fromISO(dateInfo.weekStart);
      for (let i = 0; i < 7; i++) {
        weekDates.push(start.plus({ days: i }).toFormat("yyyy-MM-dd"));
      }

      // Fetch habits with entries for the week
      const results = await db.getAllAsync<{
        habit_id: number;
        date: string;
        status: 0 | 1 | null;
      }>(
        `
        SELECT 
          h.id as habit_id,
          he.date,
          he.status
        FROM habits h
        LEFT JOIN habits_entry he ON h.id = he.habit_id 
          AND he.date BETWEEN ? AND ?
        WHERE h.active = 1
        ORDER BY h."order" ASC, h.id DESC
        `,
        [dateInfo.weekStart, dateInfo.weekEnd]
      );

      // Group by habit
      const habitMap = new Map<number, HabitWithWeeklyEntries>();

      habits.forEach((habit) => {
        habitMap.set(habit.id, {
          ...habit,
          entries: weekDates.map((date) => ({
            date,
            status: null as 0 | 1 | null,
          })),
        });
      });

      results.forEach((row) => {
        const habit = habitMap.get(row.habit_id);
        if (habit && row.date) {
          const entryIndex = weekDates.indexOf(row.date);
          if (entryIndex !== -1) {
            habit.entries[entryIndex].status = row.status ?? null;
          }
        }
      });

      return Array.from(habitMap.values());
    },
  });

  // MONTHLY view - entries for each day of the month
  const monthlyQuery = useQuery<HabitWithMonthlyEntries[]>({
    queryKey: [
      "habits-entries-monthly",
      dateInfo.monthStart,
      dateInfo.monthEnd,
    ],
    queryFn: async () => {
      // Get all active habits
      const habits = await db.getAllAsync<Habit>(
        'SELECT * FROM habits WHERE active = 1 ORDER BY "order" ASC, id DESC'
      );

      // Ensure today's entries exist
      await ensureTodayEntries(habits);

      // Generate all dates in the month
      const monthDates: string[] = [];
      const start = DateTime.fromISO(dateInfo.monthStart);
      const end = DateTime.fromISO(dateInfo.monthEnd);
      let current = start;
      while (current <= end) {
        monthDates.push(current.toFormat("yyyy-MM-dd"));
        current = current.plus({ days: 1 });
      }

      // Fetch habits with entries for the month
      const results = await db.getAllAsync<{
        habit_id: number;
        date: string;
        status: 0 | 1 | null;
      }>(
        `
        SELECT 
          h.id as habit_id,
          he.date,
          he.status
        FROM habits h
        LEFT JOIN habits_entry he ON h.id = he.habit_id 
          AND he.date BETWEEN ? AND ?
        WHERE h.active = 1
        ORDER BY h."order" ASC, h.id DESC
        `,
        [dateInfo.monthStart, dateInfo.monthEnd]
      );

      // Group by habit
      const habitMap = new Map<number, HabitWithMonthlyEntries>();

      habits.forEach((habit) => {
        habitMap.set(habit.id, {
          ...habit,
          entries: monthDates.map((date) => ({
            date,
            status: null as 0 | 1 | null,
          })),
        });
      });

      results.forEach((row) => {
        const habit = habitMap.get(row.habit_id);
        if (habit && row.date) {
          const entryIndex = monthDates.indexOf(row.date);
          if (entryIndex !== -1) {
            habit.entries[entryIndex].status = row.status ?? null;
          }
        }
      });

      return Array.from(habitMap.values());
    },
  });

  // OVERALL view - single entry per habit for today (same as today but for display purposes)
  const overallQuery = useQuery<HabitWithEntry[]>({
    queryKey: ["habits-entries-overall", dateInfo.date],
    queryFn: async () => {
      // Get all active habits
      const habits = await db.getAllAsync<Habit>(
        'SELECT * FROM habits WHERE active = 1 ORDER BY h."order" ASC, h.id DESC'
      );

      // Ensure today's entries exist
      await ensureTodayEntries(habits);

      // Fetch habits with today's entry status
      const results = await db.getAllAsync<HabitWithEntry>(
        `
        SELECT 
          h.*,
          he.status as entry_status,
          he.date as entry_date
        FROM habits h
        LEFT JOIN habits_entry he ON h.id = he.habit_id AND he.date = ?
        WHERE h.active = 1
        ORDER BY h."order" ASC, h.id DESC
        `,
        [dateInfo.date]
      );

      return results.map((r) => ({
        ...r,
        entry_status: r.entry_status ?? null,
        entry_date: r.entry_date ?? null,
      }));
    },
  });

  switch (period) {
    case "today":
      return todayQuery;
    case "weekly":
      return weeklyQuery;
    case "monthly":
      return monthlyQuery;
    case "overall":
      return overallQuery;
    default:
      return todayQuery;
  }
};
