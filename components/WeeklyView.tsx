import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import {
  HabitWithWeeklyEntries,
  useHabitEntriesByPeriod,
} from "@/hooks/useHabitEntriesByPeriod";
import { useHabits } from "@/hooks/useHabits";
import { useToggleHabitEntry } from "@/hooks/useToggleHabitEntry";
import { Habit } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { DateTime } from "luxon";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const dayLabel = (date: string) => DateTime.fromISO(date).toFormat("EEE");

export default function WeeklyView() {
  const router = useRouter();
  const today = getDateInfo().date;

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

  const { data, isLoading, error, refetch } = useHabitEntriesByPeriod("weekly");
  const weeklyData: HabitWithWeeklyEntries[] =
    (data as HabitWithWeeklyEntries[]) || [];

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

  const handleCardPress = (habit: HabitWithWeeklyEntries) => {
    // Placeholder for future detail screen navigation
  };

  const handleDayToggle = (
    habitId: number,
    date: string,
    disabled: boolean
  ) => {
    if (disabled) return;
    toggleCheck(habitId, date);
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
        <Text className="text-white">Error loading weekly data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={weeklyData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View className="bg-neutral-900 rounded-2xl p-4 mb-4">
            <TouchableOpacity
              onPress={() => handleCardPress(item)}
              onLongPress={() => openActions(item as Habit)}
              className="flex-row items-center"
              activeOpacity={0.7}
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

            <View className="flex-row justify-between mt-5">
              {item.entries.map((entry) => {
                const disabled = entry.date > today;
                const isChecked = entry.status === 1;
                const backgroundColor = isChecked
                  ? item.color || "#fff"
                  : "#2c2c2c";

                return (
                  <View
                    key={`${item.id}-${entry.date}`}
                    className="items-center"
                    style={{ width: 42 }}
                  >
                    <Text className="text-xs text-neutral-400 mb-1">
                      {dayLabel(entry.date)}
                    </Text>
                    <Pressable
                      disabled={disabled}
                      onPress={() =>
                        handleDayToggle(item.id, entry.date, disabled)
                      }
                      className="rounded-2xl items-center justify-center"
                      style={{
                        backgroundColor: disabled ? "#1a1a1a" : backgroundColor,
                        width: 38,
                        height: 38,
                        opacity: disabled ? 0.3 : 1,
                      }}
                    >
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={isChecked ? "white" : "#666666"}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
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
