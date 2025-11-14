import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    // <Tabs screenOptions={{ headerShown: false }}>
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="analytics" />
    </Tabs>
  );
}
