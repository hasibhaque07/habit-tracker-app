// components/HeatmapCell.tsx
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const SQUARE = 14;
const GAP = 6;

type Props = {
  weekStart: string | null;
  weekIndex: number;
  dayValues: (0 | 1 | null)[]; // length 7
  color?: string;
  onToggle: (dayIndex: number, current: 0 | 1 | null) => void;
};

export default React.memo(function HeatmapCell({
  dayValues,
  onToggle,
  color,
}: Props) {
  // Render a vertical stack of 7 tiny squares (top = sunday depending on your locale)
  return (
    <View style={styles.container}>
      {dayValues.map((val, dayIndex) => {
        const filled = val === 1;
        return (
          <Pressable
            key={dayIndex}
            onPress={() => onToggle(dayIndex, val)}
            style={({ pressed }) => [
              styles.square,
              {
                marginBottom: GAP,
                backgroundColor: filled ? (color ?? "#FF6B6B") : "#3a3a3a",
              },
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            android_ripple={{ color: "#222" }}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: SQUARE,
  },
  square: {
    width: SQUARE,
    height: SQUARE,
    borderRadius: 3,
  },
});
