// src/hooks/useToggleHabitEntry.ts
import { getDateInfo } from "@/utils/dateUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { DateTime } from "luxon";
import { Alert } from "react-native";

export const useToggleHabitEntry = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const toggleCheckMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const today = getDateInfo().date;
      const now = DateTime.local().toISO();

      try {
        // Check if entry exists
        const existing = await db.getFirstAsync<{
          id: number;
          status: 0 | 1;
        }>("SELECT * FROM habits_entry WHERE habit_id = ? AND date = ?", [
          habitId,
          today,
        ]);

        if (existing) {
          // Toggle status
          const newStatus = existing.status === 1 ? 0 : 1;
          await db.runAsync(
            "UPDATE habits_entry SET status = ?, updated_at = ? WHERE id = ?",
            [newStatus, now, existing.id]
          );
        } else {
          // Create new entry if missing
          await db.runAsync(
            "INSERT INTO habits_entry (habit_id, date, status, created_at) VALUES (?, ?, 1, ?)",
            [habitId, today, now]
          );
        }
      } catch (error) {
        Alert.alert("Error", "Failed to toggle habit entry.");
        console.error(error);
      }
    },
    onSuccess: () => {
      // Refresh all relevant habit queries
      queryClient.invalidateQueries({ queryKey: ["habits-daily"] });
      queryClient.invalidateQueries({ queryKey: ["habits-weekly"] });
      queryClient.invalidateQueries({ queryKey: ["habits-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["habits-overall"] });
    },
  });

  return {
    toggleCheck: (habitId: number) => toggleCheckMutation.mutate(habitId),
  };
};
