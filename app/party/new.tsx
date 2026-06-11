import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { createParty } from "@/api/crews";
import { MoviePicker } from "@/components/MoviePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TmdbMovie } from "@/lib/tmdb";
import { useAuth } from "@/providers/AuthProvider";
import { spacing, type } from "@/theme";

export default function NewPartyScreen() {
  const { crewId } = useLocalSearchParams<{ crewId: string }>();
  const { userId, profile } = useAuth();
  const [movie, setMovie] = useState<TmdbMovie | null>(null);
  const [cinema, setCinema] = useState("");
  const [city, setCity] = useState(profile?.city ?? "");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!userId || !crewId) return;
    if (!movie || !cinema.trim() || !when.trim()) {
      Alert.alert("Missing details", "Pick a movie, a cinema and a date/time.");
      return;
    }
    const startsAt = new Date(when.trim());
    if (Number.isNaN(startsAt.getTime())) {
      Alert.alert("Date format", "Use a format like 2026-06-20 19:30");
      return;
    }
    setBusy(true);
    try {
      await createParty({
        crewId,
        userId,
        movieId: String(movie.id),
        movieTitle: movie.title,
        posterPath: movie.poster_path,
        cinemaName: cinema.trim(),
        city: city.trim() || undefined,
        startsAt: startsAt.toISOString(),
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert("Could not plan party", (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.blurb}>
        Pick the film, the cinema and the time. Your crew RSVPs — then you all talk about it over
        snacks after.
      </Text>
      <MoviePicker selected={movie} onSelect={setMovie} />
      <Input label="Cinema" placeholder="e.g. PVR Forum Mall" value={cinema} onChangeText={setCinema} />
      <Input label="City" placeholder="e.g. Hyderabad" value={city} onChangeText={setCity} />
      <Input
        label="Date & time"
        placeholder="2026-06-20 19:30"
        value={when}
        onChangeText={setWhen}
        autoCapitalize="none"
      />
      <Input
        label="Notes (optional)"
        placeholder="Meet at the popcorn counter 15 min early"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button title="Plan watch party" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.lg },
  blurb: { ...type.caption, fontSize: 13, lineHeight: 19 },
});
