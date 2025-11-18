// components/HabitActionSheet.tsx
import { Habit } from "@/types/dbTypes";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import ConfirmSheet from "./ConfirmSheet";

interface HabitActionSheetProps {
  selectedHabit: Habit | null;
  actionSheetOpen: boolean;
  confirmSheet: {
    visible: boolean;
    type: "archive" | "delete" | null;
  };
  onCloseActions: () => void;
  onShowConfirm: (type: "archive" | "delete") => void;
  onCloseConfirm: () => void;
  onConfirm: () => void;
  onEdit?: (habit: Habit) => void;
  onReorder?: () => void;
}

export default function HabitActionSheet({
  selectedHabit,
  actionSheetOpen,
  confirmSheet,
  onCloseActions,
  onShowConfirm,
  onCloseConfirm,
  onConfirm,
  onEdit,
  onReorder,
}: HabitActionSheetProps) {
  return (
    <>
      {/* Bottom Actions Modal */}
      <BottomSheetModal visible={actionSheetOpen} onClose={onCloseActions}>
        <View className="items-end mb-4">
          <Pressable
            onPress={onCloseActions}
            className="bg-neutral-800 rounded-full p-2"
          >
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>

        <Pressable
          className="flex-row items-center mb-5"
          onPress={() => {
            onCloseActions();
            if (selectedHabit && onEdit) {
              onEdit(selectedHabit);
            }
          }}
        >
          <Ionicons name="pencil" size={22} color="#fff" className="mr-3" />
          <Text className="text-white text-lg">Edit</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center mb-5"
          onPress={() => {
            onCloseActions();
            onReorder?.();
          }}
        >
          <Ionicons name="swap-vertical" size={22} color="#fff" />
          <Text className="text-white text-lg ml-3">Reorder</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center mb-5"
          onPress={() => onShowConfirm("archive")}
        >
          <Ionicons name="archive" size={22} color="#fff" />
          <Text className="text-white text-lg ml-3">Archive</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center"
          onPress={() => onShowConfirm("delete")}
        >
          <Ionicons name="trash" size={22} color="#ff4d4d" />
          <Text className="text-red-400 text-lg ml-3">Delete</Text>
        </Pressable>
      </BottomSheetModal>

      {/* Delete / Archive Confirmation */}
      <ConfirmSheet
        visible={confirmSheet.visible}
        onClose={onCloseConfirm}
        title={
          confirmSheet.type === "delete"
            ? "Delete the habit?"
            : "Archive the habit?"
        }
        message="This action is permanent and cannot be reverted."
        confirmText={
          confirmSheet.type === "delete" ? "Yes, delete" : "Yes, archive"
        }
        onConfirm={onConfirm}
      />
    </>
  );
}
