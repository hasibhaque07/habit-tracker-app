import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import {
  HabitWithMonthlyEntries,
  useHabitEntriesByPeriod,
} from "@/hooks/useHabitEntriesByPeriod";
import { useHabits } from "@/hooks/useHabits";
import { useToggleHabitEntry } from "@/hooks/useToggleHabitEntry";
import { Habit } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";
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

export default function MonthlyView() {
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

  const { data, isLoading, error, refetch } =
    useHabitEntriesByPeriod("monthly");
  const monthlyData: HabitWithMonthlyEntries[] =
    (data as HabitWithMonthlyEntries[]) || [];

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

  const handleCardPress = (habit: HabitWithMonthlyEntries) => {
    // Placeholder for habit detail navigation
  };

  const squareSize = 20;

  const renderSquares = (habit: HabitWithMonthlyEntries) => {
    return habit.entries.map((entry) => {
      const isToday = entry.date === today;
      const isFuture = entry.date > today;
      const isChecked = entry.status === 1;
      const backgroundColor = isFuture
        ? "#141414"
        : isChecked
          ? habit.color || "#fff"
          : "#2f2f2f";

      return (
        <Pressable
          key={`${habit.id}-${entry.date}`}
          disabled={!isToday}
          onPress={() => toggleCheck(habit.id, entry.date)}
          className="rounded-lg"
          style={{
            width: squareSize,
            height: squareSize,
            marginRight: 6,
            marginBottom: 6,
            backgroundColor,
            borderWidth: isToday ? 1 : 0,
            borderColor: isToday ? "#ffffff30" : "transparent",
            opacity: isFuture ? 0.4 : 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      );
    });
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
        <Text className="text-white">Error loading monthly data</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={monthlyData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View className="bg-neutral-900 rounded-2xl p-4 mb-4">
            <TouchableOpacity
              onPress={() => handleCardPress(item)}
              onLongPress={() => openActions(item as Habit)}
              className="flex-row items-center mb-4"
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

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {renderSquares(item)}
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
