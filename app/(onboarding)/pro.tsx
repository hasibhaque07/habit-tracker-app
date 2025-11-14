import { storage } from "@/services/storage";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ProScreen() {
  const router = useRouter();
  const handleFinish = async () => {
    await storage.setOnboardingSeen();
    router.replace("/(tabs)"); // Go to main app
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Upgrade to Pro or start free!</Text>
      <Button title="Get Started" onPress={handleFinish} />
    </View>
  );
}
