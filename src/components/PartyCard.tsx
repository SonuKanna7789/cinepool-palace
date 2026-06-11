import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { posterUrl } from "@/lib/tmdb";
import { colors, radius, spacing, type } from "@/theme";
import type { WatchParty } from "@/types";

type Props = {
  party: WatchParty;
  onRsvp: (status: "in" | "maybe" | "out") => void;
};

const RSVP_OPTIONS = [
  { status: "in", label: "I'm in" },
  { status: "maybe", label: "Maybe" },
  { status: "out", label: "Can't" },
] as const;

export function PartyCard({ party, onRsvp }: Props) {
  const date = new Date(party.starts_at);
  const when = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {party.poster_path ? (
          <Image source={{ uri: posterUrl(party.poster_path) }} style={styles.poster} transition={200} />
        ) : (
          <View style={[styles.poster, { borderWidth: 1, borderColor: colors.borderSolid }]} />
        )}
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={styles.title} numberOfLines={2}>{party.movie_title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.gold} />
            <Text style={styles.meta}>{when} · {time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.gold} />
            <Text style={styles.meta} numberOfLines={1}>
              {party.cinema_name}
              {party.city ? `, ${party.city}` : ""}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={13} color={colors.teal} />
            <Text style={[styles.meta, { color: colors.teal }]}>{party.rsvp_count ?? 0} going</Text>
          </View>
        </View>
      </View>
      {party.notes ? <Text style={styles.notes}>{party.notes}</Text> : null}
      <View style={styles.rsvpRow}>
        {RSVP_OPTIONS.map(({ status, label }) => (
          <Pressable
            key={status}
            onPress={() => onRsvp(status)}
            style={[styles.rsvpBtn, party.my_rsvp === status && styles.rsvpActive]}
          >
            <Text
              style={[styles.rsvpLabel, party.my_rsvp === status && styles.rsvpLabelActive]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    padding: spacing.lg,
    gap: spacing.md,
  },
  top: { flexDirection: "row", gap: spacing.md },
  poster: { width: 64, height: 96, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  title: { ...type.heading, fontSize: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  meta: { ...type.caption, fontSize: 12, flexShrink: 1 },
  notes: { ...type.body, fontSize: 13, color: colors.textMuted },
  rsvpRow: { flexDirection: "row", gap: spacing.sm },
  rsvpBtn: {
    flex: 1,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    alignItems: "center",
    justifyContent: "center",
  },
  rsvpActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  rsvpLabel: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  rsvpLabelActive: { color: "#1A1404" },
});
