import { useHabits } from "@/hooks/useHabits";
import { Ionicons } from "@expo/vector-icons";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

export default function HabitsPage() {
  const { habits, deleteHabit } = useHabits();

  const confirmDelete = (id: number) => {
    Alert.alert("Delete Habit", "Are you sure you want to delete this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteHabit(id),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        My Habits
      </Text>

      {habits?.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
          No habits added yet.
        </Text>
      )}

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#f8f9fa",
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left Section */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={item?.icon as any}
                size={28}
                color={item.color || "#333"}
                style={{ marginRight: 12 }}
              />

              <View>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#777", marginTop: 3 }}>
                  Created: {item.created_at?.slice(0, 10)}
                </Text>
              </View>
            </View>

            {/* Delete Button */}
            <Pressable onPress={() => confirmDelete(item.id)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

// import { useHabits } from "@/hooks/useHabits";
// import { Ionicons } from "@expo/vector-icons";
// import { FlatList, Pressable, Text, View } from "react-native";

// export default function HabitsPage() {
//   const { habits } = useHabits();

//   return (
//     <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
//       <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
//         My Habits
//       </Text>

//       {habits?.length === 0 && (
//         <Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
//           No habits added yet.
//         </Text>
//       )}

//       <FlatList
//         data={habits}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <Pressable
//             style={{
//               padding: 14,
//               borderRadius: 12,
//               backgroundColor: "#f8f9fa",
//               marginBottom: 12,
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             <Ionicons
//               name={item?.icon as any}
//               size={28}
//               color={item.color || "#333"}
//               style={{ marginRight: 12 }}
//             />

//             <View>
//               <Text style={{ fontSize: 18, fontWeight: "600" }}>
//                 {item.name}
//               </Text>
//               <Text style={{ fontSize: 12, color: "#777", marginTop: 3 }}>
//                 Created: {item.created_at?.slice(0, 10)}
//               </Text>
//             </View>

//           </Pressable>
//         )}
//       />
//     </View>
//   );
// }
