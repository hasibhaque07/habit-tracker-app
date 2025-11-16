import { Habit } from "@/types/dbTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

export const useHabits = () => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  // ------------------------------
  // FETCH HABITS
  // ------------------------------
  const {
    data: habits = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const rows = await db.getAllAsync<Habit>(
        `SELECT * FROM habits WHERE archived = 0 ORDER BY id DESC`
      );
      return rows;
    },
  });

  // ------------------------------
  // CREATE HABIT
  // ------------------------------
  const addHabitMutation = useMutation({
    mutationFn: async ({
      icon,
      title,
      description,
      color,
    }: {
      icon: string;
      title: string;
      description?: string;
      color: string;
    }) => {
      if (!title.trim()) {
        Alert.alert("Validation", "Habit title cannot be empty.");
        return;
      }

      await db.runAsync(
        `INSERT INTO habits (icon, title, description, color, archived)
         VALUES (?, ?, ?, ?, 0)`,
        [icon, title, description ?? "", color]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to create habit.");
    },
  });

  // ------------------------------
  // UPDATE HABIT
  // ------------------------------
  const updateHabitMutation = useMutation({
    mutationFn: async ({
      id,
      icon,
      title,
      description,
      color,
    }: Partial<Habit> & { id: number }) => {
      if (!title?.trim()) {
        Alert.alert("Validation", "Habit title cannot be empty.");
        return;
      }

      //   await db.runAsync(
      //     `UPDATE habits
      //      SET icon = ?, title = ?, description = ?, color = ?
      //      WHERE id = ?`,
      //     [icon, title, description ?? "", color, id]
      //   );

      await db.runAsync(
        `UPDATE habits
         SET icon = ?, title = ?, description = ?, color = ?
         WHERE id = ?`,
        [
          icon ?? "", // replace undefined with empty string
          title ?? "", // should not be undefined, but safe
          description ?? "", // replace undefined with empty string
          color ?? "", // replace undefined with empty string
          id, // id must always be number
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update habit.");
    },
  });

  // ------------------------------
  // ARCHIVE HABIT
  // ------------------------------
  const archiveHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.runAsync(`UPDATE habits SET archived = 1 WHERE id = ?`, [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to archive habit.");
    },
  });

  // ------------------------------
  // DELETE HABIT
  // ------------------------------
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await db.runAsync(`DELETE FROM habits WHERE id = ?`, [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete habit.");
    },
  });

  return {
    habits,
    isLoading,
    error,
    refetch,

    // exposed helper functions
    addHabit: (data: {
      icon: string;
      title: string;
      description?: string;
      color: string;
    }) => addHabitMutation.mutate(data),

    updateHabit: (data: {
      id: number;
      icon: string;
      title: string;
      description?: string;
      color: string;
    }) => updateHabitMutation.mutate(data),

    archiveHabit: (id: number) => archiveHabitMutation.mutate(id),

    deleteHabit: (id: number) => deleteHabitMutation.mutate(id),
  };
};
