// components/MonthlyHabitCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Canvas, Rect as SkRect } from "@shopify/react-native-skia";
import { DateTime } from "luxon";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CELL = 14;
const GAP = 4;
const STRIDE = CELL + GAP;

const getColor = (val: 0 | 1 | null, color: string | null) =>
  val === 1 ? (color ?? "#40c463") : "#2f2f2f";

export interface MonthlyHabitCardProps {
  habit: any;
  todayIso: string;
  toggleCheckGlobal: (
    habitId: number,
    dateIso: string,
    curStatus: 0 | 1 | null
  ) => void;
  onLongPressHabit: (habit: any) => void;
}

export default function MonthlyHabitCard({
  habit,
  todayIso,
  toggleCheckGlobal,
  onLongPressHabit,
}: MonthlyHabitCardProps) {
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

    const middleIndex = Math.floor(weekStartDates.length / 2);
    const currentMonth = DateTime.fromISO(weekStartDates[middleIndex]).month;

    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w] ?? [];
      const weekStartIso = weekStartDates[w];
      if (!weekStartIso) continue;

      const weekStart = DateTime.fromISO(weekStartIso);

      for (let d = 0; d < 7; d++) {
        const cellDate = weekStart.plus({ days: d });
        const isOutside = cellDate.month !== currentMonth;

        const status = isOutside ? null : (week[d] ?? null);

        arr.push({
          x: d * STRIDE,
          y: w * STRIDE,
          status,
          opacity: isOutside ? 0 : 1,
          color: isOutside
            ? "transparent"
            : getColor(status, habit.color ?? null),
        });
      }
    }

    return arr;
  }, [habit.entries, habit.weeks, habit.color]);

  const width = 7 * STRIDE - GAP;
  const height = (habit.entries.length || 1) * STRIDE - GAP;

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

      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c1c1c",
    padding: 14,
    borderRadius: 18,
    flex: 1,
    margin: 6,
    alignContent: "center",
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
