import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/Input";
import {
  fetchNowPlaying,
  fetchTopRated,
  fetchTrending,
  searchMovies,
  type TmdbMovie,
} from "@/lib/tmdb";
import { colors, spacing, type } from "@/theme";

function Rail({ title, movies }: { title: string; movies: TmdbMovie[] }) {
  return (
    <View style={styles.rail}>
      <Text style={styles.railTitle}>{title}</Text>
      <FlatList
        horizontal
        data={movies}
        keyExtractor={(m) => String(m.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => <MovieCard movie={item} />}
      />
    </View>
  );
}

export default function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[] | null>(null);
  const [trending, setTrending] = useState<TmdbMovie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<TmdbMovie[]>([]);
  const [topRated, setTopRated] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([fetchTrending(), fetchNowPlaying(), fetchTopRated()]).then(
      ([t, n, r]) => {
        if (t.status === "fulfilled") setTrending(t.value);
        if (n.status === "fulfilled") setNowPlaying(n.value);
        if (r.status === "fulfilled") setTopRated(r.value);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setResults(await searchMovies(query.trim()));
      } catch {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Input
          placeholder="Search movies…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {results !== null ? (
        <View style={styles.resultsGrid}>
          {results.length === 0 ? (
            <Text style={styles.noResults}>No matches for “{query.trim()}”.</Text>
          ) : (
            results.map((m) => <MovieCard key={m.id} movie={m} width={104} />)
          )}
        </View>
      ) : loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
      ) : (
        <>
          <Rail title="Trending this week" movies={trending} />
          <Rail title="In cinemas now" movies={nowPlaying} />
          <Rail title="All-time greats" movies={topRated} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  rail: { gap: spacing.md },
  railTitle: { ...type.heading, paddingHorizontal: spacing.lg },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  noResults: { ...type.caption, padding: spacing.lg },
});
