import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { backdropUrl, fetchMovie, posterUrl } from "@/lib/tmdb";
import { colors, radius, spacing, type } from "@/theme";

type MovieDetail = Awaited<ReturnType<typeof fetchMovie>>;

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);

  useEffect(() => {
    if (id) fetchMovie(id).then(setMovie).catch(() => {});
  }, [id]);

  if (!movie) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={styles.hero}>
        <Image source={{ uri: backdropUrl(movie.backdrop_path) }} style={styles.backdrop} transition={300} />
        <LinearGradient colors={["transparent", colors.bg]} style={styles.fade} />
        <View style={styles.heroRow}>
          <Image source={{ uri: posterUrl(movie.poster_path) }} style={styles.poster} transition={300} />
          <View style={{ flex: 1, gap: spacing.xs, justifyContent: "flex-end" }}>
            <Text style={type.title}>{movie.title}</Text>
            <Text style={type.caption}>
              {movie.release_date?.slice(0, 4) ?? "—"}
              {movie.runtime ? ` · ${movie.runtime} min` : ""}
            </Text>
            <Text style={styles.score}>★ {movie.vote_average?.toFixed(1)} <Text style={styles.scoreCount}>({movie.vote_count?.toLocaleString()} votes)</Text></Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {movie.genres?.length ? (
          <View style={styles.genres}>
            {movie.genres.map((g) => (
              <Chip key={g.id} label={g.name} />
            ))}
          </View>
        ) : null}

        {movie.overview ? <Text style={styles.overview}>{movie.overview}</Text> : null}

        <Button
          title="Log & review this movie"
          onPress={() =>
            router.push({ pathname: "/review/[movieId]", params: { movieId: String(movie.id) } })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { position: "relative" },
  backdrop: { width: "100%", height: 240, backgroundColor: colors.surfaceAlt },
  fade: { position: "absolute", left: 0, right: 0, top: 100, height: 140 },
  heroRow: {
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: -64,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSolid,
  },
  score: { fontSize: 15, fontWeight: "800", color: colors.gold },
  scoreCount: { fontSize: 12, fontWeight: "500", color: colors.textFaint },
  body: { padding: spacing.lg, gap: spacing.lg },
  genres: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  overview: { ...type.body, color: colors.textMuted },
});
