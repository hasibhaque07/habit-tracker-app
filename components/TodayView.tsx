import { Habit } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

interface TodayViewProps {
  habits: Habit[];
}

const TodayView = ({ habits }: TodayViewProps) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="mb-20">
      {habits.map((habit) => (
        <View
          key={habit.id}
          className="flex-row items-center justify-between bg-neutral-900 rounded-2xl p-4 mb-4"
        >
          {/* Icon */}
          <View className="bg-neutral-800 rounded-2xl p-4 mr-3">
            <Ionicons
              name={habit.icon ?? "help-outline"}
              size={24}
              color="#fff"
            />
          </View>

          {/* Title */}
          <Text className="flex-1 text-white text-lg">{habit.title}</Text>

          {/* Check Button */}
          <View
            style={{ backgroundColor: habit.color }}
            className="p-3 rounded-2xl"
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default TodayView;
