import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function OnboardingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Build habits step by step!</Text>
      <Button title="Next" onPress={() => router.push("/pro")} />
    </View>
  );
}
