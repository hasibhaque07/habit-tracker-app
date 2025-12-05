import { useMemo, useState } from "react";
import { View } from "react-native";

import EmptyView from "@/components/EmptyView";
import HabitTabs from "@/components/HabitTabs";
import HomeHeader from "@/components/HomeHeader";
import MonthlyView from "@/components/MonthlyView";
import OverallView from "@/components/OverallView";
import TodayView from "@/components/TodayView";
import WeeklyView from "@/components/WeeklyView";
import { useHabits } from "@/hooks/useHabits";


const FILTERS = ["Today", "Weekly", "Monthly", "Overall"] as const;
type FilterType = (typeof FILTERS)[number];

export default function HabitsScreen() {
  const [activeTab, setActiveTab] = useState<FilterType>("Today");

  const { habits } = useHabits();

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


  const isEmpty = !habits || habits.length === 0;

  return (
    <View className="flex-1 bg-neutral-900 px-5 pt-12">
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
