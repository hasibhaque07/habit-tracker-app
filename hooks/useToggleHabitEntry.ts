// hooks/useToggleHabitEntry.ts
import { getDateInfo } from "@/utils/dateUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";
import { Alert } from "react-native";

export const useToggleHabitEntry = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const toggleCheckMutation = useMutation({
    mutationFn: async ({
      habitId,
      date,
    }: {
      habitId: number;
      date?: string;
    }) => {
      const targetDate = date || getDateInfo().date; // Use provided date or today
      const now = DateTime.local().toISO() ?? "";

      try {
        // Check if entry exists
        const existing = await db.getFirstAsync<{
          id: number;
          status: 0 | 1;
        }>("SELECT * FROM habits_entry WHERE habit_id = ? AND date = ?", [
          habitId,
          targetDate,
        ]);

        if (existing) {
          // Toggle status (allow multiple toggles per day)
          const newStatus = existing.status === 1 ? 0 : 1;
          await db.runAsync(
            "UPDATE habits_entry SET status = ?, updated_at = ? WHERE id = ?",
            [newStatus, now, existing.id]
          );
        } else {
          // Create new entry if missing (default to checked/1)
          await db.runAsync(
            "INSERT INTO habits_entry (habit_id, date, status, created_at) VALUES (?, ?, 1, ?)",
            [habitId, targetDate, now]
          );
        }
      } catch (error) {
        Alert.alert("Error", "Failed to toggle habit entry.");
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh all relevant habit queries
      queryClient.invalidateQueries({ queryKey: ["habits-entries-today"] });
      queryClient.invalidateQueries({ queryKey: ["habits-entries-weekly"] });
      queryClient.invalidateQueries({ queryKey: ["habits-entries-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["habits-entries-overall"] });
    },
  });

  return {
    toggleCheck: (habitId: number, date?: string) =>
      toggleCheckMutation.mutate({ habitId, date }),
    isToggling: toggleCheckMutation.isPending,
  };
};
