import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
      <Button title="New Habit" onPress={() => router.push("/newHabit")} />
      <Button title="Go to Pro" onPress={() => router.push("/pro")} />
      <Button title="More Options" onPress={() => router.push("/more")} />
    </View>
  );
}
