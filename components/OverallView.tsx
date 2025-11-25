// OverallHeatmap.tsx
import { useHeatmapOverall } from "@/hooks/useOverallHeatmap";
import { useToggleHabitEntry } from "@/hooks/useToggle";
import { getDateInfo } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// -------------------
// Types
// -------------------
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
  weeks: string[]; // week-start ISO strings (yyyy-MM-dd)
  entries: (0 | 1 | null)[][];
};

const DEFAULT_SQUARE = 12;
const SQUARE_GAP = 3;
const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Monday..Sunday indices for mapping

// -------------------
// Tiny ISO helpers (yyyy-MM-dd)
// -------------------
const parseIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  return new Date(y, m - 1, d);
};

const formatIso = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDaysIso = (iso: string, days: number) => {
  const dt = parseIso(iso);
  dt.setDate(dt.getDate() + days);
  return formatIso(dt);
};

const startOfWeekIso = (iso: string) => {
  // Monday-based week start
  const dt = parseIso(iso);
  const jsDay = dt.getDay(); // 0 (Sun) .. 6 (Sat)
  const isoWeekday = jsDay === 0 ? 7 : jsDay; // Monday=1..Sunday=7
  const delta = isoWeekday - 1;
  dt.setDate(dt.getDate() - delta);
  return formatIso(dt);
};

// -------------------
// HeatmapCell (memoized, tiny)
// -------------------
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
  (a, b) =>
    a.size === b.size &&
    a.status === b.status &&
    a.isToday === b.isToday &&
    a.color === b.color
);
HeatmapCell.displayName = "HeatmapCell";

// -------------------
// HabitRow (memoized shallowly) - uses horizontal FlashList for weeks
// -------------------
const HabitRow = React.memo(function HabitRow({
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
}) {
  // compute todayWeekStart + day index once
  const todayWeekStart = useMemo(() => startOfWeekIso(todayIso), [todayIso]);
  const todayDayIdx = useMemo(() => {
    const d = parseIso(todayIso).getDay(); // 0..6 (Sun..Sat)
    return d === 0 ? 6 : d - 1; // convert to Monday-based 0..6
  }, [todayIso]);

  // today's status (cheap)
  const todayStatus = useMemo(() => {
    const wi = habit.weeks.indexOf(todayWeekStart);
    if (wi >= 0) return habit.entries?.[wi]?.[todayDayIdx] ?? null;
    return null;
  }, [habit.entries, habit.weeks, todayWeekStart, todayDayIdx]);

  // Render a vertical column for a single week (7 cells)
  const renderWeek = useCallback(
    ({
      item: weekStart,
      index: weekIndex,
    }: {
      item: string;
      index: number;
    }) => {
      const weekStatuses = habit.entries?.[weekIndex] ?? Array(7).fill(null);
      return (
        <View
          key={`${habit.id}-${weekStart}-${weekIndex}`}
          style={{
            flexDirection: "column",
            marginRight: SQUARE_GAP,
            alignItems: "center",
          }}
        >
          {DAYS.map((dayIndex) => {
            const status = (weekStatuses && weekStatuses[dayIndex]) ?? null;
            const dateIso = addDaysIso(weekStart, dayIndex);
            const isToday = dateIso === todayIso;
            return (
              <HeatmapCell
                key={`${habit.id}-${weekStart}-${dayIndex}`}
                size={squareSize}
                status={status}
                isToday={isToday}
                color={habit.color ?? "#fff"}
                onPress={() => onToggleDay(habit.id, dateIso, status)}
                accessibilityLabel={`${habit.name} ${dateIso} status ${String(
                  status
                )}`}
              />
            );
          })}
        </View>
      );
    },
    [habit.id, habit.color, habit.entries, squareSize, onToggleDay, todayIso]
  );

  const weekKeyExtractor = useCallback((w: string) => w, []);

  // compute initialScrollIndex to show newest week (last)
  const initialWeekIndex =
    habit.weeks.length > 0 ? Math.max(0, habit.weeks.length - 1) : 0;

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
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
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

        <Pressable
          onPress={() => {
            const wkStart = todayWeekStart;
            const wi = habit.weeks.indexOf(wkStart);
            const curStatus =
              wi >= 0 ? (habit.entries?.[wi]?.[todayDayIdx] ?? null) : null;
            onToggleDay(habit.id, todayIso, curStatus);
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              todayStatus === 1 ? habit.color || "#fff" : "#404040",
          }}
        >
          <Ionicons name="checkmark" size={14} color="#fff" />
        </Pressable>
      </View>

      {/* Horizontal FlashList for weeks (virtualized) */}
      <FlashList
        data={habit.weeks}
        horizontal
        renderItem={renderWeek}
        keyExtractor={weekKeyExtractor}
        // estimatedItemSize={squareSize + SQUARE_GAP}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialWeekIndex}
        contentContainerStyle={{ paddingRight: 12 }}
      />
    </TouchableOpacity>
  );
}); // end HabitRow

HabitRow.displayName = "HabitRow";

// -------------------
// Main screen
// -------------------
export default function OverallHeatmap() {
  const { overallData, isLoading, error } = useHeatmapOverall();
  const { toggleCheck } = useToggleHabitEntry();
  const dateInfo = useMemo(() => getDateInfo(), []);
  const todayIso = dateInfo.date;

  const squareSize = DEFAULT_SQUARE;

  const onToggleDay = useCallback(
    (habitId: number, dateIso: string, curStatus: 0 | 1 | null) => {
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
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        // estimatedItemSize={110}
      />
    </View>
  );
}
