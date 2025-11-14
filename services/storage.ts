import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "hasSeenOnboarding4";

export const storage = {
  async hasSeenOnboarding() {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  },
  async setOnboardingSeen() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  },
};
