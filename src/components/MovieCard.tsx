import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { posterUrl, type TmdbMovie } from "@/lib/tmdb";
import { colors, radius, spacing, type } from "@/theme";

type Props = { movie: TmdbMovie; width?: number };

export function MovieCard({ movie, width = 124 }: Props) {
  return (
    <Pressable
      style={{ width }}
      onPress={() => router.push({ pathname: "/movie/[id]", params: { id: String(movie.id) } })}
    >
      <Image
        source={{ uri: posterUrl(movie.poster_path) }}
        style={[styles.poster, { width, height: width * 1.5 }]}
        transition={250}
      />
      <View style={styles.below}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>★ {movie.vote_average?.toFixed(1) ?? "–"}</Text>
          {movie.release_date ? (
            <Text style={styles.year}>{movie.release_date.slice(0, 4)}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  poster: { borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  below: { paddingTop: spacing.sm, gap: 2 },
  title: { fontSize: 13, fontWeight: "600", color: colors.text },
  scoreRow: { flexDirection: "row", justifyContent: "space-between" },
  score: { fontSize: 12, fontWeight: "700", color: colors.gold },
  year: { ...type.caption, fontSize: 12 },
});
