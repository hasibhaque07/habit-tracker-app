import { useAuthStore } from "@/services/authStorage";
import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const AnalyticsScreen = () => {
  const { resetOnboarding } = useAuthStore();
  const handleFinish = async () => {
    resetOnboarding();
    router.replace("/(onboarding)/welcome");
  };
  return (
    <View className="flex-1 bg-neutral-900 justify-center items-center">
      <Text className=" text-white ">Analytics Screen</Text>
      <Button title="Unseen" onPress={handleFinish} />
    </View>
  );
};

export default AnalyticsScreen;
