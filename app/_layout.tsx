import "@/global.css";
import { migrateDbIfNeeded } from "@/services/db";
import { storage } from "@/services/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const queryClient = new QueryClient();

  // Function to check onboarding status
  const checkOnboarding = async () => {
    const seen = await storage.hasSeenOnboarding();
    setHasSeenOnboarding(seen);
    setLoading(false);
  };

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!hasSeenOnboarding && !inOnboardingGroup) {
      router.replace("/(onboarding)/welcome");
    } else if (hasSeenOnboarding && inOnboardingGroup) {
      router.replace("/(tabs)");
    }
  }, [hasSeenOnboarding, loading, segments, router]);

  // Re-check onboarding status when navigating to tabs
  useEffect(() => {
    if (segments[0] === "(tabs)" && !loading) {
      checkOnboarding();
    }
  }, [segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Include both route groups in the Stack
  return (
    <SQLiteProvider
      databaseName="habitTrackerApp.db"
      onInit={migrateDbIfNeeded}
      options={{ useNewConnection: false }}
    >
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "#000000" }, // Add this - matches your black theme
          }}
        >
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="newHabit"
            // options={{
            //   headerShown: false,
            //   presentation: "modal",
            //   animation: "slide_from_bottom",
            // }}
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "slide_from_bottom",

              // gestureEnabled: true,
              // gestureDirection: "vertical",
              // animationDuration: 300,
            }}
          />
          <Stack.Screen name="icon" />
          <Stack.Screen
            name="more"
            options={{
              headerShown: false,
              // presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          {/* <Stack.Screen name="pro" /> */}
        </Stack>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}
