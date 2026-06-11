import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { createScreeningRequest } from "@/api/screenings";
import { MoviePicker } from "@/components/MoviePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TmdbMovie } from "@/lib/tmdb";
import { useAuth } from "@/providers/AuthProvider";
import { spacing, type } from "@/theme";

export default function NewScreeningScreen() {
  const { userId, profile } = useAuth();
  const [movie, setMovie] = useState<TmdbMovie | null>(null);
  const [cinema, setCinema] = useState("");
  const [city, setCity] = useState(profile?.city ?? "");
  const [pitch, setPitch] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!userId) return;
    if (!movie || !cinema.trim() || !city.trim()) {
      Alert.alert("Missing details", "Pick a movie, a cinema and a city.");
      return;
    }
    setBusy(true);
    try {
      await createScreeningRequest({
        userId,
        movieId: String(movie.id),
        movieTitle: movie.title,
        posterPath: movie.poster_path,
        cinemaName: cinema.trim(),
        city: city.trim(),
        pitch: pitch.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert("Could not create request", (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.blurb}>
        Want a classic back on the big screen? Start a campaign, gather votes, and show the cinema
        there's a full house waiting.
      </Text>
      <MoviePicker selected={movie} onSelect={setMovie} />
      <Input label="Cinema" placeholder="e.g. Prasads Multiplex" value={cinema} onChangeText={setCinema} />
      <Input label="City" placeholder="e.g. Hyderabad" value={city} onChangeText={setCity} />
      <Input
        label="Your pitch (optional)"
        placeholder="25th anniversary — imagine this in IMAX…"
        value={pitch}
        onChangeText={setPitch}
        multiline
      />
      <Button title="Start the campaign" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.lg },
  blurb: { ...type.caption, fontSize: 13, lineHeight: 19 },
});
