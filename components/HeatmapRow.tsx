// components/HeatmapRow.tsx
import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import HeatmapCell from "./HeatmapCell";

type Habit = {
  id: number;
  name: string;
  icon?: string | null;
  color?: string | null;
  entries: (0 | 1 | null)[][];
  // entries is weeks x 7 array
};

type Props = {
  habit: Habit;
  onToggle: (
    weekStart: string,
    dayIndex: number,
    current: 0 | 1 | null
  ) => void;
  screenWidth: number;
};

const CELL_SIZE = 14; // px (square)
const CELL_SPACING = 6;
const CELL_FULL = CELL_SIZE + CELL_SPACING;
const VISIBLE_WEEKS = 8; // how many week columns visible initially

export default React.memo(function HeatmapRow({
  habit,
  onToggle,
  screenWidth,
}: Props) {
  // weeks are derived from entries length; for each week we will render a column (7 small squares)
  const weeks = habit.entries || [];

  // compute horizontal list parameters
  const weekItemWidth = CELL_FULL;
  const getItemLayout = useCallback((_data: any, index: number) => {
    return {
      length: weekItemWidth,
      offset: weekItemWidth * index,
      index,
    };
  }, []);

  const renderWeek = useCallback(
    ({ item, index }: { item: (0 | 1 | null)[]; index: number }) => {
      // compute weekStart iso string: we need to find the weekStart for this column.
      // user hook provided weeks ordering from year start → current week; but the weekStart string
      // isn't passed in by useHeatmapOverall's result. To keep this fast, we attach weekStart
      // arrays into habit.entries as metadata in your hook; if you did not, change this to
      // pass weeks array separately. For now assume entriesMap order corresponds to weeks array
      const weekStart = (habit as any).weeks?.[index] ?? null;

      return (
        <View style={{ width: weekItemWidth, alignItems: "center" }}>
          <HeatmapCell
            weekStart={weekStart}
            weekIndex={index}
            dayValues={item}
            color={habit.color ?? "#CCCCCC"}
            onToggle={(dayIndex, current) => {
              if (!weekStart) return;
              onToggle(weekStart, dayIndex, current);
            }}
          />
        </View>
      );
    },
    [onToggle, habit, weekItemWidth]
  );

  // memoize header data
  const title = habit.name;

  return (
    <View style={styles.rowWrapper}>
      <View style={styles.header}>
        <View style={styles.iconPlaceholder}>
          {/* Replace with your icon renderer */}
          <Text style={styles.iconText}>{habit.icon ? "◎" : "🟦"}</Text>
        </View>
        <Text style={styles.habitTitle}>{title}</Text>
      </View>

      <FlatList
        data={weeks}
        keyExtractor={(_, i) => String(i)}
        horizontal
        renderItem={renderWeek}
        getItemLayout={getItemLayout}
        initialNumToRender={VISIBLE_WEEKS}
        windowSize={6}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
});
const styles = StyleSheet.create({
  rowWrapper: {
    backgroundColor: "#1f1f1f",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { color: "#fff", fontSize: 18 },
  habitTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
