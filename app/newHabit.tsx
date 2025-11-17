import ColorOption from "@/components/ColorOption";
import HabitIcon from "@/components/HabitIcon";
import IconModal from "@/components/IconModal";
import { useHabits } from "@/hooks/useHabits";
import { habitColors } from "@/utils/habitColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewHabitScreen() {
  const defaultIcon = "pulse-outline";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>(defaultIcon);
  const [color, setColor] = useState<string>(habitColors[0]);
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);

  const { addHabit } = useHabits();
  const router = useRouter();

  const saveHabit = () => {
    if (!name.trim()) return;

    addHabit({
      name,
      description,
      icon,
      color,
      frequency: "daily",
      target: 1,
    });

    router.back();
  };

  const isSaveEnabled = name.trim().length > 0;

  return (
    <View className="flex-1 bg-black">
      {/* HEADER */}
      <View className="flex-row items-center px-5 pt-12 pb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-semibold ml-4">
          New Habit
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ICON */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={() => setIsIconModalVisible(true)}
            className="w-32 h-32 rounded-full bg-neutral-900 items-center justify-center"
          >
            <HabitIcon name={icon} size={60} />
          </TouchableOpacity>
        </View>

        {/* NAME */}
        <Text className="text-white mb-2">Name</Text>
        <TextInput
          className="bg-neutral-900 p-3 rounded-xl text-white mb-5"
          placeholder="Enter habit name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />

        {/* DESCRIPTION */}
        <Text className="text-white mb-2">Description</Text>
        <TextInput
          className="bg-neutral-900 p-3 rounded-xl text-white mb-5"
          placeholder="Optional"
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
        />

        {/* COLOR */}
        <Text className="text-white mb-3">Color</Text>

        <View className="flex-row flex-wrap mb-5">
          {habitColors.map((c) => (
            <ColorOption
              key={c}
              color={c}
              selected={c === color}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* ICON MODAL */}
        <IconModal
          visible={isIconModalVisible}
          onClose={() => setIsIconModalVisible(false)}
          onSelect={(selectedIcon) => setIcon(selectedIcon)}
        />
      </ScrollView>

      {/* SAVE BUTTON (STICKY BOTTOM) */}
      <View className="absolute bottom-0 w-full px-5 pb-8">
        <TouchableOpacity
          onPress={saveHabit}
          disabled={!isSaveEnabled}
          className={`py-4 rounded-xl ${
            isSaveEnabled ? "bg-white" : "bg-neutral-800"
          }`}
        >
          <Text
            className={`text-center text-lg font-semibold ${
              isSaveEnabled ? "text-black" : "text-white"
            }`}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// import ColorOption from "@/components/ColorOption";
// import HabitIcon from "@/components/HabitIcon";
// import IconModal from "@/components/IconModal";
// import { useHabits } from "@/hooks/useHabits";
// import { habitColors } from "@/utils/habitColors";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import {
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function NewHabitScreen() {
//   const defaultIcon = "pulse-outline";
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [icon, setIcon] = useState<string>(defaultIcon);
//   const [color, setColor] = useState<string>(habitColors[0]);

//   const [isIconModalVisible, setIsIconModalVisible] = useState(false);

//   const { addHabit } = useHabits();
//   const router = useRouter();

//   const saveHabit = () => {
//     addHabit({
//       name,
//       description,
//       icon,
//       color,
//       frequency: "daily",
//       target: 1,
//     });
//     router.back();
//   };

//   return (
//     <View className="flex-1 bg-black">
//       <ScrollView className="flex-1 bg-black px-5 pt-10">
//         {/* Icon */}
//         <View className="items-center mb-5">
//           <HabitIcon
//             name={icon}
//             size={70}
//             onPress={() => setIsIconModalVisible(true)}
//           />
//         </View>

//         {/* Name */}
//         <Text className="text-white mb-2">Name</Text>
//         <TextInput
//           className="bg-neutral-900 p-3 rounded-xl text-white mb-4"
//           placeholder="Enter habit name"
//           placeholderTextColor="#777"
//           value={name}
//           onChangeText={setName}
//         />

//         {/* Description */}
//         <Text className="text-white mb-2">Description</Text>
//         <TextInput
//           className="bg-neutral-900 p-3 rounded-xl text-white mb-4"
//           placeholder="Optional"
//           placeholderTextColor="#777"
//           value={description}
//           onChangeText={setDescription}
//         />

//         {/* Color */}
//         <Text className="text-white mb-3">Color</Text>

//         <View className="flex-row flex-wrap mb-5">
//           {habitColors.map((c) => (
//             <ColorOption
//               key={c}
//               color={c}
//               selected={c === color}
//               onPress={() => setColor(c)}
//             />
//           ))}
//         </View>

//         {/* SAVE BUTTON */}
//         <TouchableOpacity
//           className="bg-neutral-800 py-4 rounded-xl mt-10"
//           onPress={saveHabit}
//         >
//           <Text className="text-center text-white text-lg font-semibold">
//             Save
//           </Text>
//         </TouchableOpacity>

//         {/* ICON MODAL */}
//         <IconModal
//           visible={isIconModalVisible}
//           onClose={() => setIsIconModalVisible(false)}
//           onSelect={(selectedIcon) => setIcon(selectedIcon)}
//         />
//       </ScrollView>
//     </View>
//   );
// }

// // app/habits/icon-picker.tsx
// import { habitIcons } from "@/utils/habitIcons";
// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// export default function IconPickerScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const onSelect = (iconName: string) => {
//     // Replace the current route with NewHabit and pass selectedIcon as param.
//     // This prevents pushing a new screen on top of the stack.
//     router.setParams({ selectedIcon: iconName }); // update previous screen params
//     router.back();
//   };

//   return (
//     <ScrollView className="flex-1 bg-black px-4 pt-10">
//       <Text className="text-white text-xl font-semibold mb-5">
//         Select an Icon
//       </Text>

//       <View className="flex-row flex-wrap">
//         {habitIcons.map((icon) => (
//           <TouchableOpacity
//             key={icon}
//             className="w-[20%] items-center p-3"
//             onPress={() => onSelect(icon)}
//           >
//             <Ionicons name={icon as any} size={35} color="white" />
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }
