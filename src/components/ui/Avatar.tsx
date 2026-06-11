import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";
import type { Profile } from "@/types";

const PALETTE = ["#F6C453", "#FF5C72", "#4FD8C4", "#9B8CFF", "#FF9F6E", "#6EC1FF"];

type Props = { profile?: Profile | null; size?: number };

export function Avatar({ profile, size = 40 }: Props) {
  const name = profile?.display_name || profile?.username || "?";
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];

  if (profile?.avatar_url) {
    return (
      <Image
        source={{ uri: profile.avatar_url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  initials: { fontWeight: "800", color: colors.bg },
});
