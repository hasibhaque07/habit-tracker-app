import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CELL_SIZE = 41;
const CELL_RADIUS = 12;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCellColor(
  status: 0 | 1 | null,
  color?: string,
  disabled?: boolean
) {
  if (disabled) return "#2c2c2c";
  if (status === 1) return color || "#40c463";
  return "#3a3a3a";
}

export default function WeeklyHabitCard({
  habit,
  toggleCheckGlobal,
  onLongPressHabit,
  todayIso,
}: any) {
  const entries = habit.entries ?? [];

  const todayIndex = useMemo(() => {
    const today = DateTime.fromISO(todayIso).startOf("day");
    return entries.findIndex((e: any) =>
      DateTime.fromISO(e.date).hasSame(today, "day")
    );
  }, [entries, todayIso]);

  const isFuture = (date: string) => {
    return (
      DateTime.fromISO(date).startOf("day") >
      DateTime.fromISO(todayIso).startOf("day")
    );
  };

  const onPressCell = (idx: number) => {
    const e = entries[idx];
    if (!e || isFuture(e.date)) return;
    toggleCheckGlobal(habit.id, e.date, e.status);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => onLongPressHabit(habit)}
        style={styles.headerRow}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={habit.icon ?? "help-outline"}
            size={22}
            color="#fff"
          />
        </View>
        <Text numberOfLines={1} style={styles.habitName}>
          {habit.name}
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 10 }}>
        <View style={styles.weekHeader}>
          {WEEKDAY_LABELS.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.cellsRow}>
          {entries.map((e: any, i: number) => {
            const disabled = isFuture(e.date);
            const color = getCellColor(e.status, habit.color, disabled);

            return (
              <Pressable
                key={i}
                onPress={() => onPressCell(i)}
                style={[
                  styles.cell,
                  {
                    backgroundColor: color,
                    opacity: disabled ? 0.45 : 1,
                  },
                ]}
              >
                {e.status === 1 && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161616",
    padding: 14,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
  },
  habitName: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "600",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: "center",
    color: "#bbbbbb",
    fontSize: 13,
  },
  cellsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
});
