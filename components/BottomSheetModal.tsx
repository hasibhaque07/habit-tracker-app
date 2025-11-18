import React from "react";
import { Modal, Pressable, View } from "react-native";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheetModal({
  visible,
  onClose,
  children,
}: BottomSheetModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* DARK BACKDROP */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* BOTTOM SHEET */}
      <View className="absolute bottom-0 left-0 right-0 bg-neutral-900 p-6 rounded-t-3xl">
        {children}
      </View>
    </Modal>
  );
}
