import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { submitReview } from "@/api/reviews";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Stars } from "@/components/ui/Stars";
import { fetchMovie } from "@/lib/tmdb";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, type } from "@/theme";

const PLATFORMS = ["Cinema", "Netflix", "Prime Video", "Disney+", "Apple TV+", "Other"];

export default function ReviewScreen() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const { userId } = useAuth();
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (movieId) fetchMovie(movieId).then((m) => setTitle(m.title)).catch(() => {});
  }, [movieId]);

  const submit = async () => {
    if (!userId || !movieId) return;
    if (rating === 0) {
      Alert.alert("Rate it first", "Tap the stars to set your rating.");
      return;
    }
    setBusy(true);
    try {
      await submitReview({
        userId,
        movieId,
        rating,
        reviewText: text.trim() || undefined,
        platform: platform ?? undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert("Could not save review", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {title ? <Text style={type.title}>{title}</Text> : null}

      <View style={styles.ratingBlock}>
        <Text style={type.micro}>Your rating</Text>
        <Stars rating={rating} size={36} onRate={setRating} />
        <Text style={styles.ratingHint}>
          {rating === 0 ? "Tap to rate" : `${rating} / 5`}
        </Text>
      </View>

      <Input
        label="Review (optional)"
        placeholder="What stayed with you?"
        value={text}
        onChangeText={setText}
        multiline
      />

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.micro, { marginLeft: spacing.xs }]}>Watched on</Text>
        <View style={styles.platformRow}>
          {PLATFORMS.map((p) => (
            <Chip
              key={p}
              label={p}
              active={platform === p}
              onPress={() => setPlatform(platform === p ? null : p)}
            />
          ))}
        </View>
      </View>

      <Button title="Post review" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.xl },
  ratingBlock: { alignItems: "center", gap: spacing.sm },
  ratingHint: { ...type.caption, color: colors.gold, fontWeight: "700" },
  platformRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
