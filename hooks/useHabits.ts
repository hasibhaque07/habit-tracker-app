import { Habit } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

export const useHabits = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const t = getDateInfo();

  // Get all habits
  const {
    data: habits = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const rows = await db.getAllAsync<Habit>(
        "SELECT * FROM habits WHERE active = 1 ORDER BY id DESC"
      );
      return rows;
    },
  });

  // Create habit
  const addHabitMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      icon,
      color,
      frequency,
      target,
    }: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      frequency?: "daily" | "weekly" | "monthly" | "custom";
      target?: number;
    }) => {
      if (!name.trim()) {
        Alert.alert("Validation", "Habit name cannot be empty.");
        return;
      }

      // Use dateUtils for consistent timestamp formatting

      const createdAt = t.isoTimestamp;

      await db.runAsync(
        "INSERT INTO habits (name, description, icon, color, created_at, frequency, target, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          description ?? "",
          icon ?? "",
          color ?? "",
          createdAt,
          frequency ?? "daily",
          target ?? 0,
          1, // active = 1
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to create habit. Try again.");
    },
  });

  // Update habit
  const updateHabitMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      icon,
      color,
      frequency,
      target,
    }: {
      id: number;
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      frequency?: "daily" | "weekly" | "monthly" | "custom";
      target?: number;
    }) => {
      if (name && !name.trim()) {
        Alert.alert("Validation", "Habit name cannot be empty.");
        return;
      }

      // Build dynamic UPDATE query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
      }
      if (icon !== undefined) {
        updates.push("icon = ?");
        values.push(icon);
      }
      if (color !== undefined) {
        updates.push("color = ?");
        values.push(color);
      }
      if (frequency !== undefined) {
        updates.push("frequency = ?");
        values.push(frequency);
      }
      if (target !== undefined) {
        updates.push("target = ?");
        values.push(target);
      }

      if (updates.length === 0) {
        return; // No updates to make
      }

      values.push(id); // Add id for WHERE clause

      await db.runAsync(
        `UPDATE habits SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update habit. Try again.");
    },
  });

  // Archive habit (set active = 0)
  const archiveHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.runAsync("UPDATE habits SET active = 0 WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to archive habit. Try again.");
    },
  });

  // Delete habit
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.runAsync("DELETE FROM habits WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete habit. Try again.");
    },
  });

  return {
    habits: habits || [],
    isLoading,
    error,
    refetch,
    addHabit: (data: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      frequency?: "daily" | "weekly" | "monthly" | "custom";
      target?: number;
    }) => addHabitMutation.mutate(data),
    updateHabit: (data: {
      id: number;
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      frequency?: "daily" | "weekly" | "monthly" | "custom";
      target?: number;
    }) => updateHabitMutation.mutate(data),
    archiveHabit: (id: number) => archiveHabitMutation.mutate(id),
    deleteHabit: (id: number) => deleteHabitMutation.mutate(id),
  };
};
