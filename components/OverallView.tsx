// OverallHeatmap.tsx
import { useHeatmapOverall } from "@/hooks/useOverallHeatmap"; // your hook
import { useToggleHabitEntry } from "@/hooks/useToggle";
import { getDateInfo } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Small reusable types from your data shape
type OverallHabit = {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  frequency: string;
  target?: number | null;
  active: number;
  order: number;
  // weeks: array of week-start ISO strings (yyyy-MM-dd)
  weeks: string[];
  // entries: rows per week, each is array of 7 statuses (Mon..Sun)
  entries: (0 | 1 | null)[][];
};

const DEFAULT_SQUARE = 12;
const SQUARE_GAP = 3;

// Heatmap cell (memoized)
const HeatmapCell = React.memo(
  ({
    size,
    status,
    isToday,
    color,
    onPress,
    accessibilityLabel,
  }: {
    size: number;
    status: 0 | 1 | null;
    isToday: boolean;
    color: string | null | undefined;
    onPress?: () => void;
    accessibilityLabel?: string;
  }) => {
    const backgroundColor = status === 1 ? color || "#ffffff" : "#2f2f2f";
    const borderWidth = isToday ? 1 : 0;
    const borderColor = isToday ? "#ffffff40" : "transparent";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={{
          width: size,
          height: size,
          marginBottom: SQUARE_GAP,
          backgroundColor,
          borderRadius: 3,
          borderWidth,
          borderColor,
        }}
      />
    );
  },
  (prev, next) =>
    prev.size === next.size &&
    prev.status === next.status &&
    prev.isToday === next.isToday &&
    prev.color === next.color
);

HeatmapCell.displayName = "HeatmapCell";

// Component rendering one habit row (name + horizontal weeks scroll)
const HabitRow = React.memo(
  ({
    habit,
    squareSize,
    todayIso,
    onToggleDay,
  }: {
    habit: OverallHabit;
    squareSize: number;
    todayIso: string;
    onToggleDay: (
      habitId: number,
      dateIso: string,
      curStatus: 0 | 1 | null
    ) => void;
  }) => {
    const scrollRef = useRef<ScrollView | null>(null);

    // Scroll to end when weeks length changes (to show newest weeks)
    useEffect(() => {
      // small delay for layout
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      });
    }, [habit.weeks.length]);

    // Helper to compute cell date iso for weekIndex/dayIndex
    const dateFor = useCallback((weekStartIso: string, dayIndex: number) => {
      return DateTime.fromISO(weekStartIso)
        .plus({ days: dayIndex })
        .toFormat("yyyy-MM-dd");
    }, []);

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={{
          backgroundColor: "#0f0f0f",
          borderRadius: 14,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#151515",
              padding: 8,
              borderRadius: 10,
              marginRight: 8,
            }}
          >
            <Ionicons
              name={(habit.icon as any) ?? "help-outline"}
              size={18}
              color="#fff"
            />
          </View>

          <Text
            numberOfLines={1}
            style={{ color: "white", flex: 1, fontSize: 14 }}
          >
            {habit.name}
          </Text>

          {/* Quick today checkbox (optional): toggles today's date in-place */}
          <Pressable
            onPress={() => {
              // find index of today's week + day index
              const todayDt = DateTime.fromISO(todayIso);
              const todayWeekStart = todayDt
                .startOf("week")
                .toFormat("yyyy-MM-dd");
              const weekIndex = habit.weeks.indexOf(todayWeekStart);
              if (weekIndex >= 0) {
                const dayIndex = todayDt.weekday - 1;
                const curStatus =
                  habit.entries?.[weekIndex]?.[dayIndex] ?? null;
                onToggleDay(habit.id, todayIso, curStatus);
              } else {
                // If today's week isn't present, compute date and toggle using todayIso
                const curStatus = null;
                onToggleDay(habit.id, todayIso, curStatus);
              }
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: (() => {
                // find today's status to set color
                const todayDt = DateTime.fromISO(todayIso);
                const todayWeekStart = todayDt
                  .startOf("week")
                  .toFormat("yyyy-MM-dd");
                const weekIndex = habit.weeks.indexOf(todayWeekStart);
                const dayIndex = todayDt.weekday - 1;
                const todayStatus =
                  weekIndex >= 0
                    ? habit.entries?.[weekIndex]?.[dayIndex]
                    : null;
                return todayStatus === 1 ? habit.color || "#fff" : "#404040";
              })(),
            }}
          >
            <Ionicons name="checkmark" size={14} color="#fff" />
          </Pressable>
        </View>

        {/* Grid: horizontal scroll of week columns */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 12 }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {habit.weeks.map((weekStart, weekIndex) => {
              const weekStatuses =
                habit.entries?.[weekIndex] ?? Array(7).fill(null);
              return (
                <View
                  key={`week-${habit.id}-${weekStart}-${weekIndex}`}
                  style={{
                    flexDirection: "column",
                    marginRight: SQUARE_GAP,
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const status =
                      (weekStatuses && weekStatuses[dayIndex]) ?? null;
                    const dateIso = dateFor(weekStart, dayIndex);
                    const isToday = dateIso === todayIso;

                    return (
                      <HeatmapCell
                        key={`${habit.id}-${weekStart}-${dayIndex}`}
                        size={squareSize}
                        status={status}
                        isToday={isToday}
                        color={habit.color ?? "#fff"}
                        onPress={() => onToggleDay(habit.id, dateIso, status)}
                        accessibilityLabel={`${habit.name} ${dateIso} status ${String(status)}`}
                      />
                    );
                  })}
                </View>
              );
            })}

            {/* If the last week might be incomplete (defensive) we still fill blanks */}
          </View>
        </ScrollView>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    // shallow checks to prevent re-render when nothing changed
    if (prev.habit.id !== next.habit.id) return false;
    if (prev.habit.weeks.length !== next.habit.weeks.length) return false;
    if (prev.squareSize !== next.squareSize) return false;
    if (prev.todayIso !== next.todayIso) return false;

    // deep-ish compare statuses length and values
    for (let w = 0; w < prev.habit.entries.length; w++) {
      const pWeek = prev.habit.entries[w] || [];
      const nWeek = next.habit.entries[w] || [];
      if (pWeek.length !== nWeek.length) return false;
      for (let d = 0; d < Math.max(pWeek.length, nWeek.length); d++) {
        if (pWeek[d] !== nWeek[d]) return false;
      }
    }
    return true;
  }
);

HabitRow.displayName = "HabitRow";

// Main screen: lists all habits
export default function OverallHeatmap() {
  const { overallData, isLoading, error, refetch } = useHeatmapOverall();
  const { toggleCheck } = useToggleHabitEntry();
  const dateInfo = useMemo(() => getDateInfo(), []);
  const todayIso = dateInfo.date;

  // square size - you can expose as prop or compute based on device width
  const squareSize = DEFAULT_SQUARE;

  const onToggleDay = useCallback(
    (habitId: number, dateIso: string, curStatus: 0 | 1 | null) => {
      // Use your hook's API: toggleCheck(habitId, dateIso, curStatus)
      // It will compute the actual new value inside your hook
      toggleCheck(habitId, dateIso, curStatus);
    },
    [toggleCheck]
  );

  const renderItem = useCallback(
    ({ item }: { item: OverallHabit }) => (
      <HabitRow
        habit={item}
        squareSize={squareSize}
        todayIso={todayIso}
        onToggleDay={onToggleDay}
      />
    ),
    [squareSize, todayIso, onToggleDay]
  );

  const keyExtractor = useCallback(
    (item: OverallHabit) => item.id.toString(),
    []
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Error loading heatmap</Text>
      </View>
    );
  }

  const data = (overallData ?? []) as OverallHabit[];

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={6}
        initialNumToRender={6}
      />
    </View>
  );
}
