import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        size === "sm" && styles.sm,
        pressed && { opacity: 0.75 },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.bg : colors.text} />
      ) : (
        <Text style={[styles.label, size === "sm" && styles.labelSm, variant === "primary" && styles.labelPrimary, variant === "danger" && styles.labelDanger]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  sm: { height: 36, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  primary: { backgroundColor: colors.gold },
  secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderSolid },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.danger },
  label: { fontSize: 16, fontWeight: "700", color: colors.text },
  labelSm: { fontSize: 13 },
  labelPrimary: { color: "#1A1404" },
  labelDanger: { color: colors.danger },
});
