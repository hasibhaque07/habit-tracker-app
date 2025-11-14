import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to Habit Tracker!</Text>
      <Button
        title="Next"
        onPress={() => router.push("/(onboarding)/onboarding")}
      />
    </View>
  );
}
