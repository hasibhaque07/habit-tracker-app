
import { iconCategories, uniqueIcons } from "@/utils/iconCategories";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function IconPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"Icon" | "Emoji">("Icon");

  const onSelect = (iconName: string) => {
    // Replace the current route with NewHabit and pass selectedIcon as param.
    // This prevents pushing a new screen on top of the stack.
    router.setParams({ selectedIcon: iconName }); // update previous screen params
    router.back();
  };

  // Filter icons based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return iconCategories;
    }

    const query = searchQuery.toLowerCase();
    return iconCategories
      .map((category) => ({
        ...category,
        icons: category.icons.filter((icon) =>
          icon.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.icons.length > 0);
  }, [searchQuery]);

  // Filter all icons for search (flat list)
  const filteredAllIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return uniqueIcons.filter((icon) => icon.toLowerCase().includes(query));
  }, [searchQuery]);

  const renderIconItem = (icon: string) => (
    <TouchableOpacity
      key={icon}
      className="w-[12.5%] items-center p-3"
      onPress={() => onSelect(icon)}
    >
      <Ionicons name={icon as any} size={28} color="#fff" />
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: (typeof iconCategories)[0] }) => (
    <View className="mb-6">
      <Text className="text-white text-lg font-semibold mb-3 px-1">
        {item.name}
      </Text>
      <View className="flex-row flex-wrap">
        {item.icons.map(renderIconItem)}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View className="flex-row px-5 mb-4">
        <TouchableOpacity
          onPress={() => setSelectedTab("Icon")}
          className={`flex-1 py-3 rounded-xl mr-2 ${
            selectedTab === "Icon" ? "bg-neutral-800" : "bg-neutral-900"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === "Icon" ? "text-white" : "text-neutral-400"
            }`}
          >
            Icon
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab("Emoji")}
          className={`flex-1 py-3 rounded-xl ml-2 ${
            selectedTab === "Emoji" ? "bg-neutral-800" : "bg-neutral-900"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === "Emoji" ? "text-white" : "text-neutral-400"
            }`}
          >
            Emoji
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-neutral-900 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#777" />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder="Type a search term"
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Icons List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "Icon" ? (
          searchQuery.trim() ? (
            // Show flat list when searching
            <View className="flex-row flex-wrap">
              {filteredAllIcons.map(renderIconItem)}
            </View>
          ) : (
            // Show categorized list when not searching
            <FlatList
              data={filteredCategories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.name}
              scrollEnabled={false}
            />
          )
        ) : (
          // Emoji section (placeholder for now)
          <View className="items-center justify-center py-20">
            <Text className="text-neutral-400 text-lg">
              Emoji feature coming soon
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
