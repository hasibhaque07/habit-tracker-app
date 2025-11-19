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
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Memoized grid cell component for better performance
const GridCell = React.memo<{
  habitId: number;
  date: string;
  status: 0 | 1 | null;
  isToday: boolean;
  isFuture: boolean;
  color: string;
  squareSize: number;
  onPress: (habitId: number, date: string) => void;
}>(
  ({
    habitId,
    date,
    status,
    isToday,
    isFuture,
    color,
    squareSize,
    onPress,
  }) => {
    const isChecked = status === 1;
    const backgroundColor = isFuture
      ? "#141414"
      : isChecked
        ? color
        : "#2f2f2f";

    return (
      <Pressable
        disabled={isFuture}
        onPress={() => onPress(habitId, date)}
        style={{
          width: squareSize,
          height: squareSize,
          marginRight: 4,
          backgroundColor,
          borderRadius: 2,
          borderWidth: isToday ? 1 : 0,
          borderColor: isToday ? "#ffffff30" : "transparent",
          opacity: isFuture ? 0.4 : 1,
        }}
      />
    );
  },
  (prev, next) => {
    // Custom comparison for memo - only re-render if relevant props change
    return (
      prev.habitId === next.habitId &&
      prev.date === next.date &&
      prev.status === next.status &&
      prev.isToday === next.isToday &&
      prev.isFuture === next.isFuture &&
      prev.color === next.color &&
      prev.squareSize === next.squareSize
    );
  }
);

GridCell.displayName = "GridCell";

// Memoized empty cell component
const EmptyCell = React.memo<{ squareSize: number }>(({ squareSize }) => (
  <View
    style={{
      width: squareSize,
      height: squareSize,
      marginRight: 4,
      backgroundColor: "transparent",
    }}
  />
));

EmptyCell.displayName = "EmptyCell";

// Memoized habit card component
const HabitCard = React.memo<{
  habit: HabitWithMonthlyEntries;
  today: string;
  futureDates: Set<string>;
  monthOffset: number;
  squareSize: number;
  totalDaysInMonth: number;
  onCheckboxPress: (habit: HabitWithMonthlyEntries, e: any) => void;
  onGridSquarePress: (habitId: number, date: string) => void;
  onCardPress: (habit: HabitWithMonthlyEntries) => void;
  onCardLongPress: (habit: Habit) => void;
}>(
  ({
    habit,
    today,
    futureDates,
    monthOffset,
    squareSize,
    totalDaysInMonth,
    onCheckboxPress,
    onGridSquarePress,
    onCardPress,
    onCardLongPress,
  }) => {
    // Pre-calculate today's entry status (memoized per habit)
    const todayEntry = useMemo(
      () => habit.entries.find((e) => e.date === today),
      [habit.entries, today]
    );
    const isTodayChecked = todayEntry?.status === 1;
    const checkboxColor = isTodayChecked ? habit.color || "#fff" : "#404040";
    const checkmarkColor = isTodayChecked ? "white" : "#666666";

    // Pre-calculate grid structure (memoized per habit)
    const gridRows = useMemo(() => {
      if (!habit.entries || habit.entries.length === 0) return [];

      // Only use entries up to totalDaysInMonth (exactly the month's days)
      const monthEntries = habit.entries.slice(0, totalDaysInMonth);

      // Create cells array with offset empty cells at the start
      const cells: ({ date: string; status: 0 | 1 | null } | null)[] = [];
      for (let i = 0; i < monthOffset; i++) {
        cells.push(null);
      }

      // Add only the month's entries (exactly totalDaysInMonth days)
      monthEntries.forEach((entry) => {
        cells.push({ date: entry.date, status: entry.status });
      });

      // Group into rows of 7 (weeks)
      const rows: ({ date: string; status: 0 | 1 | null } | null)[][] = [];
      for (let i = 0; i < cells.length; i += 7) {
        const row = cells.slice(i, i + 7);
        // Only add row if it has at least one day cell (not all empty)
        if (row.some((cell) => cell !== null)) {
          rows.push(row);
        }
      }

      return rows;
    }, [habit.entries, monthOffset, totalDaysInMonth]);

    // Calculate grid width for centering
    const gridWidth = useMemo(() => {
      // 7 columns * (squareSize + 4px margin) - last margin
      return 7 * (squareSize + 4) - 4;
    }, [squareSize]);

    return (
      <TouchableOpacity
        className="bg-neutral-900 rounded-2xl p-4 mb-4"
        style={{ width: "48%" }}
        activeOpacity={0.85}
        onPress={() => onCardPress(habit)}
        onLongPress={() => onCardLongPress(habit as Habit)}
      >
        {/* Header: Icon, Name, Checkbox */}
        <View className="flex-row items-center mb-3">
          <View className="bg-neutral-800 rounded-2xl p-3 mr-2">
            <Ionicons
              name={(habit.icon as any) ?? "help-outline"}
              size={20}
              color="#fff"
            />
          </View>
          <Text
            className="flex-1 text-white text-base"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {habit.name}
          </Text>
          <Pressable
            onPress={(e) => onCheckboxPress(habit, e)}
            className="rounded-xl items-center justify-center"
            style={{
              backgroundColor: checkboxColor,
              width: 28,
              height: 28,
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="checkmark" size={14} color={checkmarkColor} />
          </Pressable>
        </View>

        {/* Monthly Grid - Centered */}
        <View style={{ marginTop: 12, alignItems: "center" }}>
          <View style={{ width: gridWidth }}>
            {gridRows.map((week, rowIndex) => (
              <View
                key={`week-${habit.id}-${rowIndex}`}
                style={{ flexDirection: "row", marginBottom: 4 }}
              >
                {week.map((cell, colIndex) => {
                  if (!cell || !cell.date) {
                    return (
                      <EmptyCell
                        key={`empty-${habit.id}-${rowIndex}-${colIndex}`}
                        squareSize={squareSize}
                      />
                    );
                  }

                  const isToday = cell.date === today;
                  const isFuture = futureDates.has(cell.date);

                  return (
                    <GridCell
                      key={`${habit.id}-${cell.date}`}
                      habitId={habit.id}
                      date={cell.date}
                      status={cell.status}
                      isToday={isToday}
                      isFuture={isFuture}
                      color={habit.color || "#fff"}
                      squareSize={squareSize}
                      onPress={onGridSquarePress}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    // Custom comparison - only re-render if habit data actually changed
    return (
      prev.habit.id === next.habit.id &&
      prev.habit.entries.length === next.habit.entries.length &&
      prev.habit.entries.every(
        (e, i) =>
          e.date === next.habit.entries[i].date &&
          e.status === next.habit.entries[i].status
      ) &&
      prev.habit.color === next.habit.color &&
      prev.today === next.today &&
      prev.monthOffset === next.monthOffset &&
      prev.totalDaysInMonth === next.totalDaysInMonth &&
      prev.squareSize === next.squareSize
    );
  }
);

HabitCard.displayName = "HabitCard";

export default function MonthlyView() {
  const router = useRouter();

  // Memoize dateInfo - only calculate once per render
  const dateInfo = useMemo(() => getDateInfo(), []);
  const today = dateInfo.date;
  const monthStart = dateInfo.monthStart;
  const monthEnd = dateInfo.monthEnd;

  // Calculate total days in month
  const totalDaysInMonth = useMemo(() => {
    const start = DateTime.fromISO(monthStart);
    const end = DateTime.fromISO(monthEnd);
    return end.diff(start, "days").days + 1; // +1 to include both start and end
  }, [monthStart, monthEnd]);

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

  const { data, isLoading, error } = useHabitEntriesByPeriod("monthly");
  const monthlyData: HabitWithMonthlyEntries[] =
    (data as HabitWithMonthlyEntries[]) || [];

  // Remove refetch on focus - it's expensive and not needed
  // useFocusEffect(
  //   useCallback(() => {
  //     refetch();
  //   }, [refetch])
  // );

  const handleArchive = useCallback(
    (habit: Habit) => {
      archiveHabit(habit.id);
    },
    [archiveHabit]
  );

  const handleDelete = useCallback(
    (habit: Habit) => {
      deleteHabit(habit.id);
    },
    [deleteHabit]
  );

  const handleEdit = useCallback(
    (habit: Habit) => {
      router.push({
        pathname: "/newHabit",
        params: { habitId: habit.id.toString() },
      });
    },
    [router]
  );

  const handleReorder = useCallback(() => {
    router.push("/reorder");
  }, [router]);

  const handleCardPress = useCallback((habit: HabitWithMonthlyEntries) => {
    // Placeholder for habit detail navigation
  }, []);

  const handleCheckboxPress = useCallback(
    (habit: HabitWithMonthlyEntries, e: any) => {
      e.stopPropagation();
      toggleCheck(habit.id);
    },
    [toggleCheck]
  );

  const handleGridSquarePress = useCallback(
    (habitId: number, date: string) => {
      toggleCheck(habitId, date);
    },
    [toggleCheck]
  );

  const handleCardLongPress = useCallback(
    (habit: Habit) => {
      openActions(habit);
    },
    [openActions]
  );

  // Pre-calculate month offset once (same for all habits in the same month)
  const monthOffset = useMemo(() => {
    const firstDateObj = DateTime.fromISO(monthStart);
    const firstWeekday = firstDateObj.weekday; // 1=Monday, 7=Sunday
    return firstWeekday === 7 ? 6 : firstWeekday - 1;
  }, [monthStart]);

  // Pre-calculate future dates Set for O(1) lookup instead of O(n) string comparison
  const futureDates = useMemo(() => {
    const future = new Set<string>();
    const todayDate = DateTime.fromISO(today);
    const endDate = DateTime.fromISO(monthEnd);
    let current = todayDate.plus({ days: 1 }); // Start from tomorrow

    while (current <= endDate) {
      future.add(current.toFormat("yyyy-MM-dd"));
      current = current.plus({ days: 1 });
    }
    return future;
  }, [today, monthEnd]);

  // Calculate square size - larger for better visibility
  const squareSize = useMemo(() => 14, []);

  // Memoize render function
  const renderItem = useCallback(
    ({ item }: { item: HabitWithMonthlyEntries }) => {
      return (
        <HabitCard
          habit={item}
          today={today}
          futureDates={futureDates}
          monthOffset={monthOffset}
          squareSize={squareSize}
          totalDaysInMonth={totalDaysInMonth}
          onCheckboxPress={handleCheckboxPress}
          onGridSquarePress={handleGridSquarePress}
          onCardPress={handleCardPress}
          onCardLongPress={handleCardLongPress}
        />
      );
    },
    [
      today,
      futureDates,
      monthOffset,
      squareSize,
      totalDaysInMonth,
      handleCheckboxPress,
      handleGridSquarePress,
      handleCardPress,
      handleCardLongPress,
    ]
  );

  // Memoize key extractor
  const keyExtractor = useCallback(
    (item: HabitWithMonthlyEntries) => item.id.toString(),
    []
  );

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
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 30 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={5}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * Math.floor(index / 2),
          index,
        })}
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
