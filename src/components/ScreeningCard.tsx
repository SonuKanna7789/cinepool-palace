import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { posterUrl } from "@/lib/tmdb";
import { colors, radius, spacing, type } from "@/theme";
import type { ScreeningRequest } from "@/types";

type Props = { request: ScreeningRequest; onVote: () => void };

const STATUS_STYLES: Record<ScreeningRequest["status"], { label: string; color: string }> = {
  open: { label: "OPEN", color: colors.gold },
  accepted: { label: "SCREENING!", color: colors.success },
  declined: { label: "DECLINED", color: colors.textFaint },
};

export function ScreeningCard({ request, onVote }: Props) {
  const status = STATUS_STYLES[request.status];
  return (
    <View style={styles.card}>
      {request.poster_path ? (
        <Image source={{ uri: posterUrl(request.poster_path) }} style={styles.poster} transition={200} />
      ) : (
        <View style={[styles.poster, { borderWidth: 1, borderColor: colors.borderSolid }]} />
      )}
      <View style={{ flex: 1, gap: spacing.xs }}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{request.movie_title}</Text>
          <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="film-outline" size={13} color={colors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>
            {request.cinema_name}, {request.city}
          </Text>
        </View>
        {request.pitch ? (
          <Text style={styles.pitch} numberOfLines={2}>{request.pitch}</Text>
        ) : null}
      </View>
      <Pressable onPress={onVote} style={[styles.voteBtn, request.has_voted && styles.voted]}>
        <Ionicons
          name={request.has_voted ? "flame" : "flame-outline"}
          size={20}
          color={request.has_voted ? "#1A1404" : colors.gold}
        />
        <Text style={[styles.voteCount, request.has_voted && { color: "#1A1404" }]}>
          {request.vote_count ?? 0}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  poster: { width: 56, height: 84, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  title: { ...type.heading, fontSize: 15, flex: 1 },
  status: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  meta: { ...type.caption, fontSize: 12, flexShrink: 1 },
  pitch: { ...type.caption, fontSize: 12, fontStyle: "italic" },
  voteBtn: {
    width: 52,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  voted: { backgroundColor: colors.gold },
  voteCount: { fontSize: 13, fontWeight: "800", color: colors.gold },
});
