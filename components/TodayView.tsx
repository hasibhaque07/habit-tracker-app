// components/TodayView.tsx
import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import { useHabits } from "@/hooks/useHabits";
import { Habit } from "@/types/dbTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TodayViewProps {
  habits: Habit[];
}

export default function TodayView({ habits }: TodayViewProps) {
  const router = useRouter();
  const {
    selectedHabit,
    actionSheetOpen,
    confirmSheet,
    openActions,
    closeActions,
    showConfirm,
    closeConfirm,
    handleConfirm,
  } = useHabitActions();

  const { archiveHabit, deleteHabit } = useHabits();

  const handleArchive = (habit: Habit) => {
    archiveHabit(habit.id);
  };

  const handleDelete = (habit: Habit) => {
    deleteHabit(habit.id);
  };

  const handleEdit = (habit: Habit) => {
    router.push({
      pathname: "/newHabit",
      params: { habitId: habit.id.toString() },
    });
  };

  const handleReorder = () => {
    router.push("/reorder");
  };

  return (
    <View className="flex-1">
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between bg-neutral-900 rounded-2xl p-4 mb-4">
            <TouchableOpacity
              onLongPress={() => openActions(item)}
              className="flex-row items-center flex-1"
            >
              <View className="bg-neutral-800 rounded-2xl p-4 mr-3">
                <Ionicons
                  name={(item.icon as any) ?? "help-outline"}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text className="flex-1 text-white text-lg">{item.name}</Text>
            </TouchableOpacity>

            <Pressable
              className="p-3 rounded-2xl"
              style={{ backgroundColor: item.color }}
            >
              <Ionicons name="checkmark" size={18} color="white" />
            </Pressable>
          </View>
        )}
      />

      <HabitActionSheet
        selectedHabit={selectedHabit}
        actionSheetOpen={actionSheetOpen}
        confirmSheet={confirmSheet}
        onCloseActions={closeActions}
        onShowConfirm={showConfirm}
        onCloseConfirm={closeConfirm}
        onConfirm={() => handleConfirm(handleArchive, handleDelete)}
        onEdit={handleEdit}
        onReorder={handleReorder}
      />
    </View>
  );
}
