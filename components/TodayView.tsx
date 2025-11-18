import BottomSheetModal from "@/components/BottomSheetModal";
import ConfirmSheet from "@/components/ConfirmSheet";
import { Habit } from "@/types/dbTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TodayViewProps {
  habits: Habit[];
}

export default function TodayView({ habits }: TodayViewProps) {
  const router = useRouter();

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [confirmSheet, setConfirmSheet] = useState<{
    visible: boolean;
    type: "archive" | "delete" | null;
  }>({ visible: false, type: null });

  const openActions = (habit: Habit) => {
    setSelectedHabit(habit);
    setActionSheetOpen(true);
  };

  const closeActions = () => {
    setActionSheetOpen(false);
  };

  const showConfirm = (type: "archive" | "delete") => {
    closeActions();
    setConfirmSheet({ visible: true, type });
  };

  const closeConfirm = () => {
    setConfirmSheet({ visible: false, type: null });
  };

  const handleConfirm = () => {
    if (!selectedHabit) return;

    if (confirmSheet.type === "archive") {
      console.log("Archive habit:", selectedHabit.id);
    } else if (confirmSheet.type === "delete") {
      console.log("Delete habit:", selectedHabit.id);
    }

    closeConfirm();
  };

  return (
    <View className="flex-1">
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between bg-neutral-900 rounded-2xl p-4 mb-4">
            {/* Row pressable (opens modal) */}
            <TouchableOpacity
              onLongPress={() => openActions(item)}
              // onPress={() => openActions(item)}
              className="flex-row items-center flex-1"
            >
              {/* Icon */}
              <View className="bg-neutral-800 rounded-2xl p-4 mr-3">
                <Ionicons
                  name={(item.icon as any) ?? "help-outline"}
                  size={24}
                  color="#fff"
                />
              </View>

              {/* Title */}
              <Text className="flex-1 text-white text-lg">{item.name}</Text>
            </TouchableOpacity>

            {/* Check button (independent) */}
            <Pressable
              // onPress={() => toggleCheck(item)} // <-- you will implement this
              className="p-3 rounded-2xl"
              style={{ backgroundColor: item.color }}
            >
              <Ionicons name="checkmark" size={18} color="white" />
            </Pressable>
          </View>
        )}
      />

      {/* Bottom Actions Modal */}
      <BottomSheetModal visible={actionSheetOpen} onClose={closeActions}>
        <View className="items-end mb-4">
          <Pressable
            onPress={closeActions}
            className="bg-neutral-800 rounded-full p-2"
          >
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>

        <Pressable
          className="flex-row items-center mb-5"
          onPress={() => {
            closeActions();
            // router.push(`/habits/edit/${selectedHabit?.id}`);
          }}
        >
          <Ionicons name="pencil" size={22} color="#fff" className="mr-3" />
          <Text className="text-white text-lg">Edit</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center mb-5"
          onPress={() => {
            closeActions();
            // router.push("/habits/reorder");
          }}
        >
          <Ionicons name="swap-vertical" size={22} color="#fff" />
          <Text className="text-white text-lg ml-3">Reorder</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center mb-5"
          onPress={() => showConfirm("archive")}
        >
          <Ionicons name="archive" size={22} color="#fff" />
          <Text className="text-white text-lg ml-3">Archive</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center"
          onPress={() => showConfirm("delete")}
        >
          <Ionicons name="trash" size={22} color="#ff4d4d" />
          <Text className="text-red-400 text-lg ml-3">Delete</Text>
        </Pressable>
      </BottomSheetModal>

      {/* Delete / Archive Confirmation */}
      <ConfirmSheet
        visible={confirmSheet.visible}
        onClose={closeConfirm}
        title={
          confirmSheet.type === "delete"
            ? "Delete the habit?"
            : "Archive the habit?"
        }
        message="This action is permanent and cannot be reverted."
        confirmText={
          confirmSheet.type === "delete" ? "Yes, delete" : "Yes, archive"
        }
        onConfirm={handleConfirm}
      />
    </View>
  );
}
