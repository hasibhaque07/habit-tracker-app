import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function OnboardingLayout() {
  return (
    // <Stack screenOptions={{ headerShown: false }}>
    <>
      <StatusBar hidden={true} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#000000" }, // Add this - matches your black theme
        }}
      >
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            presentation: "transparentModal",
          }}
        />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="pro" />
      </Stack>
    </>
  );
}
