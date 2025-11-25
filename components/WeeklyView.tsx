import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import { useHabits } from "@/hooks/useHabits";
import { useToggleHabitEntry } from "@/hooks/useToggle";
import { useHeatmapWeekly } from "@/hooks/useWeeklyHeatmap";
import { Habit } from "@/types/dbTypes";
import { getDateInfo } from "@/utils/dateUtils";

import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// -------------------
// FAST WEEKDAY CACHE
// -------------------
const getWeekdayLabel = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { weekday: "short" });

// -------------------
// MEMOIZED DAY CIRCLE
// -------------------
const DayCircle = React.memo(function DayCircle({
  entry,
  disabled,
  color,
  label,
  onToggle,
}: {
  entry: any;
  disabled: boolean;
  color: string;
  label: string;
  onToggle: () => void;
}) {
  const isChecked = entry.status === 1;

  return (
    <View className="items-center" style={{ width: 42 }}>
      <Text className="text-xs text-neutral-400 mb-1">{label}</Text>

      <Pressable
        disabled={disabled}
        onPress={onToggle}
        className="rounded-2xl items-center justify-center"
        style={{
          backgroundColor: disabled ? "#1a1a1a" : isChecked ? color : "#2c2c2c",
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
});

// -------------------
// MEMOIZED HABIT ROW
// -------------------
const HabitRow = React.memo(function HabitRow({
  item,
  today,
  weekdayLabels,
  onToggle,
  openActions,
}: {
  item: any;
  today: string;
  weekdayLabels: Record<string, string>;
  openActions: (habit: Habit) => void;
  onToggle: (hid: number, entry: any, disabled: boolean) => void;
}) {
  // Pre-map entries so `.map` uses a stable array
  const entryList = item.entries;

  return (
    <View className="bg-neutral-900 rounded-2xl p-4 mb-4">
      <TouchableOpacity
        onLongPress={() => openActions(item)}
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
        {entryList.map((entry: any) => {
          const disabled = entry.date > today;

          return (
            <DayCircle
              key={entry.date}
              entry={entry}
              disabled={disabled}
              color={item.color || "#fff"}
              label={weekdayLabels[entry.date]}
              onToggle={() => onToggle(item.id, entry, disabled)}
            />
          );
        })}
      </View>
    </View>
  );
});

// ==================
//      MAIN VIEW
// ==================
export default function WeeklyView() {
  const router = useRouter();
  const today = getDateInfo().date;

  const {
    weeklyData: weeklyDatas,
    isLoading,
    error,
    refetch,
  } = useHeatmapWeekly();

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

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  //-----------------------
  //   WEEKDAY LABEL MAP
  //-----------------------
  const weekdayLabels = useMemo(() => {
    const map: Record<string, string> = {};
    weeklyDatas?.forEach((habit) => {
      habit.entries.forEach((entry) => {
        if (!map[entry.date]) {
          map[entry.date] = getWeekdayLabel(entry.date);
        }
      });
    });
    return map;
  }, [weeklyDatas]);

  //-----------------------
  //  STABLE TOGGLE HANDLER
  //-----------------------
  const onToggle = useCallback(
    (habitId: number, entry: any, disabled: boolean) => {
      if (!disabled) {
        toggleCheck(habitId, entry.date, entry.status);
      }
    },
    [toggleCheck]
  );

  // -------------------
  // LOADING / ERROR UI
  // -------------------
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

  // -------------------
  //       UI
  // -------------------
  return (
    <View className="flex-1">
      <FlashList
        data={weeklyDatas}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <HabitRow
            item={item}
            today={today}
            weekdayLabels={weekdayLabels}
            openActions={openActions}
            onToggle={onToggle}
          />
        )}
      />

      <HabitActionSheet
        selectedHabit={selectedHabit}
        actionSheetOpen={actionSheetOpen}
        confirmSheet={confirmSheet}
        onCloseActions={closeActions}
        onShowConfirm={showConfirm}
        onCloseConfirm={closeConfirm}
        onConfirm={() =>
          handleConfirm(
            (habit) => archiveHabit(habit.id),
            (habit) => deleteHabit(habit.id)
          )
        }
        onEdit={(habit) =>
          router.push({
            pathname: "/newHabit",
            params: { habitId: habit.id.toString() },
          })
        }
        onReorder={() => router.push("/reorder")}
      />
    </View>
  );
}
