import { storage } from "@/services/storage";
import React from "react";
import { Button, Text, View } from "react-native";

const analytics = () => {
  const handleFinish = async () => {
    await storage.setOnboardingUnseen();
  };
  return (
    <View className="flex-1 bg-neutral-900 justify-center items-center">
      <Text className=" text-white ">analytics</Text>
      <Button title="Unseen" onPress={handleFinish} />
    </View>
  );
};

export default analytics;
