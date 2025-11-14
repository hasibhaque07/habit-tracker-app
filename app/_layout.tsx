// //import { storage } from "@/services/storage";
// import { storage } from "@/services/storage";
// import { Redirect, Stack, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { ActivityIndicator, View } from "react-native";

// export default function RootLayout() {
//   const [loading, setLoading] = useState(true);
//   const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

//   const router = useRouter();

//   useEffect(() => {
//     const check = async () => {
//       const seen = await storage.hasSeenOnboarding();
//       setHasSeenOnboarding(seen);
//       setLoading(false);
//     };
//     check();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   // If first time → go to onboarding flow

//   if (!hasSeenOnboarding) {
//     return <Redirect href="/(onboarding)/welcome" />;
//     //router.replace("/(onboarding)/welcome");
//   }

//   // Otherwise go to main app
//   return (
//     <Stack>
//       {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
//       <Stack.Screen name="(tabs)" />
//       <Stack.Screen name="newHabit" />
//       <Stack.Screen name="icon" />
//       <Stack.Screen name="more" />
//     </Stack>
//   );
// }

import { storage } from "@/services/storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const router = useRouter();
  const segments = useSegments();

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

  // const [loading, setLoading] = useState(true);
  // const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // const router = useRouter();
  // const segments = useSegments();

  // useEffect(() => {
  //   const check = async () => {
  //     const seen = await storage.hasSeenOnboarding();
  //     setHasSeenOnboarding(seen);
  //     setLoading(false);
  //   };
  //   check();
  // }, []);

  // useEffect(() => {
  //   if (loading) return;

  //   const inOnboardingGroup = segments[0] === "(onboarding)";

  //   if (!hasSeenOnboarding && !inOnboardingGroup) {
  //     router.replace("/(onboarding)/welcome");
  //   } else if (hasSeenOnboarding && inOnboardingGroup) {
  //     router.replace("/(tabs)");
  //   }

  // }, [hasSeenOnboarding, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Include both route groups in the Stack
  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="newHabit" />
      <Stack.Screen name="icon" />
      <Stack.Screen name="more" />
      {/* <Stack.Screen name="pro" /> */}
    </Stack>
  );
}
