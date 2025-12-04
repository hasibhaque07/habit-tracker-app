import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function OnboardingLayout() {
  return (
    // <Stack screenOptions={{ headerShown: false }}>
    <>
      <StatusBar hidden={true} />
      <Stack
        screenOptions={{
          // contentStyle: { backgroundColor: "#000000" },
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="pro" />
      </Stack>
    </>
  );
}
