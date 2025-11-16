import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const HomeHeader = () => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <Ionicons name="grid-outline" size={26} color="white" />
      <Text className="text-white text-3xl font-bold">Habits</Text>

      <Link href="/newHabit">
        <Ionicons name="add" size={30} color="white" />
      </Link>
    </View>
  );
};

export default HomeHeader;
