// app/habits/icon-picker.tsx
import { habitIcons } from "@/utils/habitIcons";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function IconPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const onSelect = (iconName: string) => {
    // Replace the current route with NewHabit and pass selectedIcon as param.
    // This prevents pushing a new screen on top of the stack.
    router.setParams({ selectedIcon: iconName }); // update previous screen params
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-10">
      <Text className="text-white text-xl font-semibold mb-5">
        Select an Icon
      </Text>

      <View className="flex-row flex-wrap">
        {habitIcons.map((icon) => (
          <TouchableOpacity
            key={icon}
            className="w-[20%] items-center p-3"
            onPress={() => onSelect(icon)}
          >
            <Ionicons name={icon as any} size={35} color="white" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
