import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const NewHabitScreen = () => {
  return (
    <View>
      <Stack.Screen options={{ animation: "slide_from_bottom" }} />
      <Text>NewHabitScreen</Text>
    </View>
  );
};

export default NewHabitScreen;
