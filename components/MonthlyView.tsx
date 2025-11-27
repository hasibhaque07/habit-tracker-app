// MonthlyView.tsx
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Canvas, Rect as SkRect } from "@shopify/react-native-skia";
import React, { useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import HabitActionSheet from "@/components/HabitActionSheet";
import { useHabitActions } from "@/hooks/useHabitActions";
import { useHabits } from "@/hooks/useHabits";
import { useMonthlyHeatmap } from "@/hooks/useMonthlyHeatmap";
import { useToggleHabitEntry } from "@/hooks/useToggle";
import { getDateInfo } from "@/utils/dateUtils";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";

const CELL = 14;
const GAP = 4;
const STRIDE = CELL + GAP;

// normal color function
const getColor = (val: 0 | 1 | null, color: string | null) =>
  val === 1 ? (color ?? "#40c463") : "#2f2f2f";

/* -------------------------- Types -------------------------- */
interface HabitCardProps {
  habit: any; // Ideally use your Habit type
  todayIso: string;
  toggleCheckGlobal: (
    habitId: number,
    dateIso: string,
    curStatus: number | null
  ) => void;
  onLongPressHabit: (habit: any) => void;
}

/* ----------------------- Habit Card ------------------------ */
function HabitCard({
  habit,
  todayIso,
  toggleCheckGlobal,
  onLongPressHabit,
}: HabitCardProps) {
  const scrollRef = useRef<ScrollView>(null);

  const rects = useMemo(() => {
    const arr: {
      x: number;
      y: number;
      status: 0 | 1 | null;
      opacity: number;
      color: string;
    }[] = [];

    const weeks = habit.entries ?? [];
    const weekStartDates = habit.weeks ?? [];

    if (!weekStartDates.length) return arr;

    // Use the middle week to infer the target month (robust for month-overlapping weeks)
    const middleIndex = Math.floor(weekStartDates.length / 2);
    const currentMonth = DateTime.fromISO(weekStartDates[middleIndex]).month;

    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w] ?? [];
      const weekStartIso = weekStartDates[w];

      if (!weekStartIso) continue;

      const weekStart = DateTime.fromISO(weekStartIso);

      for (let d = 0; d < 7; d++) {
        const cellDate = weekStart.plus({ days: d });

        // Transparent if cellDate NOT in current month (Option A)
        const isOutside = cellDate.month !== currentMonth;

        const status = isOutside ? null : (week[d] ?? null);

        arr.push({
          x: d * STRIDE,
          y: w * STRIDE,
          status,
          opacity: isOutside ? 0 : 1,
          color: isOutside
            ? "transparent"
            : getColor(week[d] ?? null, habit.color ?? null),
        });
      }
    }

    return arr;
  }, [habit.entries, habit.weeks, habit.color]);

  const width = 7 * STRIDE - GAP;
  const height = (habit.entries.length || 1) * STRIDE - GAP;

  // today's status
  const todayWeekIndex = Math.max(0, (habit.entries?.length ?? 1) - 1);
  const weekdayIdx = DateTime.fromISO(todayIso).weekday - 1;
  const todayStatus =
    (habit.entries?.[todayWeekIndex]?.[weekdayIdx] as 0 | 1 | null) ?? null;

  const onPressToday = () => {
    toggleCheckGlobal(habit.id, todayIso, todayStatus);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={() => onLongPressHabit(habit)}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={habit.icon ?? "help-outline"}
            size={20}
            color="#fff"
          />
        </View>

        <Text numberOfLines={1} style={styles.habitName}>
          {habit.name}
        </Text>

        <TouchableOpacity
          onPress={onPressToday}
          style={[
            styles.checkButton,
            { backgroundColor: todayStatus === 1 ? habit.color : "#404040" },
          ]}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Heatmap */}
      <ScrollView
        ref={scrollRef}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ alignItems: "flex-start" }}
      >
        {/* wrap canvas in a fixed-size View to avoid unexpected centering/clipping */}
        <View style={{ width, height }}>
          <Canvas style={{ width, height }}>
            {rects.map((r, i) => (
              <SkRect
                key={i}
                x={r.x}
                y={r.y}
                width={CELL}
                height={CELL}
                opacity={r.opacity}
                color={r.color}
              />
            ))}
          </Canvas>
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
}

/* ------------------------ Main View ------------------------ */
export default function MonthlyView() {
  const router = useRouter();

  const { monthlyData, isLoading, error } = useMonthlyHeatmap();
  const { toggleCheck } = useToggleHabitEntry();
  const { archiveHabit, deleteHabit } = useHabits();

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

  const { date: todayIso } = getDateInfo();

  const toggleCheckGlobal = (
    habitId: number,
    dateIso: string,
    curStatus: any
  ) => toggleCheck(habitId, dateIso, curStatus);

  if (isLoading)
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>Error loading monthly heatmap</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={monthlyData ?? []}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            todayIso={todayIso}
            toggleCheckGlobal={toggleCheckGlobal}
            onLongPressHabit={openActions}
          />
        )}
      />

      {/* Action Sheet */}
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

/* ------------------------ Styles ------------------------ */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#1c1c1c",
    padding: 14,
    borderRadius: 18,
    flex: 1,
    margin: 6,
    alignItems: "flex-start", // changed from "center" to avoid centering / clipping
    justifyContent: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  iconWrap: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },

  habitName: { color: "white", fontSize: 15, flex: 1 },

  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
