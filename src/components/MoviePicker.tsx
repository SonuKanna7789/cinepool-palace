import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { posterUrl, searchMovies, type TmdbMovie } from "@/lib/tmdb";
import { colors, radius, spacing, type } from "@/theme";
import { Input } from "./ui/Input";

type Props = {
  selected: TmdbMovie | null;
  onSelect: (movie: TmdbMovie) => void;
};

export function MoviePicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setResults((await searchMovies(query.trim())).slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <View style={styles.selectedRow}>
        <Image source={{ uri: posterUrl(selected.poster_path) }} style={styles.selectedPoster} />
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedTitle}>{selected.title}</Text>
          <Text style={type.caption}>
            {selected.release_date?.slice(0, 4) ?? ""} · ★ {selected.vote_average?.toFixed(1)}
          </Text>
        </View>
        <Pressable onPress={() => onSelect(null as unknown as TmdbMovie)} hitSlop={8}>
          <Text style={styles.change}>Change</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Input
        label="Movie"
        placeholder="Search a movie…"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      {searching ? <ActivityIndicator color={colors.gold} /> : null}
      <FlatList
        data={results}
        keyExtractor={(m) => String(m.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable style={styles.resultRow} onPress={() => onSelect(item)}>
            <Image source={{ uri: posterUrl(item.poster_path) }} style={styles.resultPoster} />
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={type.caption}>{item.release_date?.slice(0, 4) ?? "—"}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: spacing.md,
  },
  selectedPoster: { width: 44, height: 66, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  selectedTitle: { ...type.heading, fontSize: 15 },
  change: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultPoster: { width: 36, height: 54, borderRadius: 6, backgroundColor: colors.surfaceAlt },
  resultTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
});
