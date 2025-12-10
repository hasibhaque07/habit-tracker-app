import "@/global.css";
import { migrateDbIfNeeded } from "@/services/db";
import { storage } from "@/services/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );

  const router = useRouter();
  const segments = useSegments();
  const queryClient = new QueryClient();

  // Function to check onboarding status
  const checkOnboarding = async () => {
    // setLoading(true);
    const seen = await storage.hasSeenOnboarding();
    setHasSeenOnboarding(seen);
    setLoading(false);
  };

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (loading) return;
    //if (hasSeenOnboarding === null) return;

    // const timeout = setTimeout(() => {
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!hasSeenOnboarding && !inOnboardingGroup) {
      router.replace("/(onboarding)/welcome");
    }
    if (hasSeenOnboarding && inOnboardingGroup) {
      router.replace("/(tabs)");
    }
    //}, 40); // 40ms works best to load data as async storage is slow

    //return () => clearTimeout(timeout);
  }, [hasSeenOnboarding, loading, segments, router]);

  // Re-check onboarding status when navigating to tabs
  useEffect(() => {
    // if (segments[0] === "(tabs)" && !loading) {
    //   checkOnboarding();
    // }
    if (segments[0] === "(tabs)" && !loading && hasSeenOnboarding === false) {
      // Just marked as completed, update state without async wait
      setHasSeenOnboarding(true);
    }
  }, [segments, loading]);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#171717" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000000",
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#171717" }}>
      <StatusBar hidden={true} />
      {/* <StatusBar className="bg-neutral-900" /> */}
      <SQLiteProvider
        databaseName="habitTrackerApp4.db"
        onInit={migrateDbIfNeeded}
        options={{ useNewConnection: false }}
      >
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#171717" },
              //animation: "none",
            }}
          >
            <Stack.Screen
              name="(onboarding)"
              options={{ headerShown: false }}
            />

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="newHabit"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="icon" />
            <Stack.Screen
              name="more"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="reorder"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
