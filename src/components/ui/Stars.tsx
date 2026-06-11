import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";

type Props = {
  rating: number;
  size?: number;
  onRate?: (rating: number) => void;
};

export function Stars({ rating, size = 14, onRate }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon =
          rating >= star ? "star" : rating >= star - 0.5 ? "star-half" : "star-outline";
        const star_ = (
          <Ionicons
            key={star}
            name={icon}
            size={size}
            color={rating >= star - 0.5 ? colors.gold : colors.textFaint}
          />
        );
        return onRate ? (
          <Pressable key={star} onPress={() => onRate(star)} hitSlop={6}>
            {star_}
          </Pressable>
        ) : (
          star_
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.xs / 2, alignItems: "center" },
});
