import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const EmptyView = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-white text-2xl font-semibold mb-2">
        No habit found
      </Text>

      <Text className="text-gray-400 mb-6">
        Create a new habit to track progress
      </Text>

      <Link href="/newHabit" asChild>
        <TouchableOpacity className="bg-neutral-800 rounded-full px-8 py-4 flex-row items-center">
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white ml-2 text-lg font-medium">Create</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default EmptyView;
