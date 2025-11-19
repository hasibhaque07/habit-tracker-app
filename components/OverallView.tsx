import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import {
  HabitWithEntry,
  useHabitEntriesByPeriod,
} from "@/hooks/useHabitEntriesByPeriod";
import { useHabits } from "@/hooks/useHabits";
import { useToggleHabitEntry } from "@/hooks/useToggleHabitEntry";
import { Habit } from "@/types/dbTypes";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OverallView() {
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
  const { toggleCheck } = useToggleHabitEntry();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useHabitEntriesByPeriod("overall");
  const overallData: HabitWithEntry[] = (data as HabitWithEntry[]) || [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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

  const handleCardPress = (habit: HabitWithEntry) => {
    // Placeholder for habit detail navigation
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white">Error loading overall data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={overallData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => {
          const isChecked = item.entry_status === 1;
          const checkboxColor = isChecked ? item.color || "#fff" : "#404040";
          const checkmarkColor = isChecked ? "white" : "#666666";

          return (
            <View className="flex-row items-center justify-between bg-neutral-900 rounded-2xl p-4 mb-4">
              <TouchableOpacity
                onPress={() => handleCardPress(item)}
                onLongPress={() => openActions(item as Habit)}
                className="flex-row items-center flex-1"
                activeOpacity={0.7}
              >
                <View className="bg-neutral-800 rounded-2xl p-4 mr-3">
                  <Ionicons
                    name={(item.icon as any) ?? "help-outline"}
                    size={24}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg">{item.name}</Text>
                  <Text className="text-neutral-400 text-xs mt-1">
                    Track today&apos;s completion
                  </Text>
                </View>
              </TouchableOpacity>

              <Pressable
                onPress={() => toggleCheck(item.id)}
                className="rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: checkboxColor,
                  width: 48,
                  height: 48,
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="checkmark" size={18} color={checkmarkColor} />
              </Pressable>
            </View>
          );
        }}
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
