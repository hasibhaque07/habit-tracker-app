// src/hooks/useHabitByPeriod.ts
import { getDateInfo } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import type { SQLiteDatabase } from "expo-sqlite";

export function useHabitByPeriod(db: SQLiteDatabase) {
  const t = getDateInfo();

  // DAILY
  const daily = useQuery({
    queryKey: ["habits-daily", t.date],
    queryFn: async () => {
      return db.getAllAsync(
        `
        SELECT habits.*, habits_entry.status, habits_entry.date
        FROM habits
        LEFT JOIN habits_entry
          ON habits.id = habits_entry.habit_id
          AND habits_entry.date = ?
        WHERE habits.active = 1
        `,
        [t.date]
      );
    },
  });

  // WEEKLY
  const weekly = useQuery({
    queryKey: ["habits-weekly", t.weekStart, t.weekEnd],
    queryFn: async () => {
      return db.getAllAsync(
        `
        SELECT habits.*, habits_entry.status, habits_entry.date
        FROM habits
        LEFT JOIN habits_entry
          ON habits.id = habits_entry.habit_id
          AND habits_entry.date BETWEEN ? AND ?
        WHERE habits.active = 1
        `,
        [t.weekStart, t.weekEnd]
      );
    },
  });

  // MONTHLY
  const monthly = useQuery({
    queryKey: ["habits-monthly", t.monthStart, t.monthEnd],
    queryFn: async () => {
      return db.getAllAsync(
        `
        SELECT habits.*, habits_entry.status, habits_entry.date
        FROM habits
        LEFT JOIN habits_entry
          ON habits.id = habits_entry.habit_id
          AND habits_entry.date BETWEEN ? AND ?
        WHERE habits.active = 1
        `,
        [t.monthStart, t.monthEnd]
      );
    },
  });

  // OVERALL
  const overall = useQuery({
    queryKey: ["habits-overall"],
    queryFn: async () => {
      return db.getAllAsync(
        `
        SELECT habits.*, habits_entry.status, habits_entry.date
        FROM habits
        LEFT JOIN habits_entry
          ON habits.id = habits_entry.habit_id
        WHERE habits.active = 1
        ORDER BY habits.created_at ASC
        `
      );
    },
  });

  return {
    dailyHabits: daily,
    weeklyHabits: weekly,
    monthlyHabits: monthly,
    overallHabits: overall,
  };
}
