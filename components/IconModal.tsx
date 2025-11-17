// components/IconModal.tsx
import { habitIcons } from "@/utils/habitIcons";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface IconModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
}

export default function IconModal({
  visible,
  onClose,
  onSelect,
}: IconModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Background overlay */}
      <View className="flex-1 bg-black/70 justify-end">
        {/* Modal content */}
        <View className="bg-neutral-900 rounded-t-2xl p-5 h-[60%]">
          <Text className="text-white text-xl font-semibold mb-4">
            Select an Icon
          </Text>

          <ScrollView>
            <View className="flex-row flex-wrap">
              {habitIcons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  className="w-[20%] items-center p-4"
                  onPress={() => {
                    onSelect(icon);
                    onClose();
                  }}
                >
                  <Ionicons name={icon as any} size={35} color="white" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            className="bg-neutral-800 py-3 rounded-xl mt-4"
            onPress={onClose}
          >
            <Text className="text-center text-white">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
