import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { posterUrl } from "@/lib/tmdb";
import { colors, radius, spacing, type } from "@/theme";
import type { FeedItem } from "@/types";
import { Avatar } from "./ui/Avatar";
import { Stars } from "./ui/Stars";

function timeAgo(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

export function ReviewCard({ item }: { item: FeedItem }) {
  const name = item.profile?.display_name || "Cinephile";
  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => router.push({ pathname: "/user/[id]", params: { id: item.user_id } })}
      >
        <Avatar profile={item.profile} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {timeAgo(item.created_at)}
            {item.platform_watched ? `  ·  on ${item.platform_watched}` : ""}
          </Text>
        </View>
        <Stars rating={item.rating} />
      </Pressable>

      <Pressable
        style={styles.movieRow}
        onPress={() =>
          router.push({ pathname: "/movie/[id]", params: { id: item.movie_id } })
        }
      >
        {item.movie?.poster_path ? (
          <Image
            source={{ uri: posterUrl(item.movie.poster_path) }}
            style={styles.poster}
            transition={200}
          />
        ) : (
          <View style={[styles.poster, styles.posterFallback]} />
        )}
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.movie?.title ?? "Unknown movie"}
          </Text>
          {item.movie?.genres?.length ? (
            <Text style={styles.meta} numberOfLines={1}>
              {item.movie.genres.slice(0, 3).join(" · ")}
            </Text>
          ) : null}
          {item.review_text ? (
            <Text style={styles.review} numberOfLines={4}>
              “{item.review_text}”
            </Text>
          ) : null}
        </View>
      </Pressable>
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
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  name: { ...type.heading, fontSize: 15 },
  meta: { ...type.caption, fontSize: 12 },
  movieRow: { flexDirection: "row", gap: spacing.md },
  poster: { width: 72, height: 108, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  posterFallback: { borderWidth: 1, borderColor: colors.borderSolid },
  movieTitle: { ...type.heading, fontSize: 16 },
  review: { ...type.body, fontSize: 14, color: colors.textMuted, fontStyle: "italic" },
});
