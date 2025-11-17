import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    // <Stack screenOptions={{ headerShown: false }}>
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#000000" }, // Add this - matches your black theme
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="pro" />
    </Stack>
  );
}
