import { useMemo, useState } from "react";
import { View } from "react-native";

import EmptyView from "@/components/EmptyView";
import HabitTabs from "@/components/HabitTabs";
import HomeHeader from "@/components/HomeHeader";
import MonthlyView from "@/components/MonthlyView";
import OverallView from "@/components/OverallView";
import TodayView from "@/components/TodayView";
import WeeklyView from "@/components/WeeklyView";
import type { Habit } from "@/types/types";

const mockHabits: Habit[] = [
  {
    id: 1,
    title: "Wake up early",
    icon: "alarm-outline",
    color: "#F77F7F",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 2,
    title: "Exercise",
    icon: "barbell-outline",
    color: "#C084FC",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 3,
    title: "Reading",
    icon: "book-outline",
    color: "#FBBF24",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 4,
    title: "Wake up early",
    icon: "alarm-outline",
    color: "#F77F7F",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 5,
    title: "Exercise",
    icon: "barbell-outline",
    color: "#C084FC",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 6,
    title: "Reading",
    icon: "book-outline",
    color: "#FBBF24",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 7,
    title: "Wake up early",
    icon: "alarm-outline",
    color: "#F77F7F",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 8,
    title: "Exercise",
    icon: "barbell-outline",
    color: "#C084FC",
    description: "",
    active: 1,
    created_at: "",
  },
  {
    id: 9,
    title: "Reading",
    icon: "book-outline",
    color: "#FBBF24",
    description: "",
    active: 1,
    created_at: "",
  },
];

const FILTERS = ["Today", "Weekly", "Monthly", "Overall"] as const;
type FilterType = (typeof FILTERS)[number];

export default function HabitsScreen() {
  const [activeTab, setActiveTab] = useState<FilterType>("Today");

  const habits: Habit[] = mockHabits;

  const renderContent = useMemo(() => {
    if (!habits || habits.length === 0) return null;

    switch (activeTab) {
      case "Today":
        return <TodayView habits={habits} />;
      case "Weekly":
        return <WeeklyView />;
      case "Monthly":
        return <MonthlyView />;
      case "Overall":
        return <OverallView />;
      default:
        return null;
    }
  }, [activeTab, habits]);

  //const isEmpty = true;
  const isEmpty = !habits || habits.length === 0;

  return (
    <View className="flex-1 bg-black px-5 pt-16">
      {/* Header */}
      <HomeHeader />

      {/* Tabs Component */}
      <HabitTabs
        filters={FILTERS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Conditional Content */}
      {isEmpty ? <EmptyView /> : renderContent}
    </View>
  );
}
