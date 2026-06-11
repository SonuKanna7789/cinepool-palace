import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, spacing, type } from "@/theme";

type Props = TextInputProps & { label?: string };

export function Input({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={[styles.input, rest.multiline && styles.multiline, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...type.micro, marginLeft: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
    color: colors.text,
    fontSize: 15,
  },
  multiline: { height: 100, paddingTop: spacing.md, textAlignVertical: "top" },
});
