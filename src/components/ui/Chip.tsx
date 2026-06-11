import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "@/theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.active]}
      disabled={!onPress}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSolid,
  },
  active: { backgroundColor: colors.gold, borderColor: colors.gold },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  labelActive: { color: "#1A1404" },
});
