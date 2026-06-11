import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateProfile } from "@/api/profiles";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { spacing, type } from "@/theme";

const GENRES = [
  "Drama", "Comedy", "Thriller", "Sci-Fi", "Horror", "Romance",
  "Action", "Animation", "Documentary", "Crime", "Fantasy", "Mystery",
];

export default function Onboarding() {
  const { userId, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const toggle = (g: string) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const finish = async () => {
    if (!userId) return;
    if (genres.length < 3) {
      Alert.alert("Pick at least 3", "Your genres seed your taste profile.");
      return;
    }
    setBusy(true);
    try {
      await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, favorite_genres: genres }, { onConflict: "user_id" });
      await updateProfile(userId, { is_onboarded: true, city: city.trim() || null });
      await refreshProfile();
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Could not save", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={{ gap: spacing.sm }}>
        <Text style={type.hero}>What do you love watching?</Text>
        <Text style={styles.sub}>
          Pick at least three genres. This seeds the taste profile other cinephiles will follow you
          for.
        </Text>
      </View>

      <View style={styles.grid}>
        {GENRES.map((g) => (
          <Chip key={g} label={g} active={genres.includes(g)} onPress={() => toggle(g)} />
        ))}
      </View>

      <Input
        label="Your city (for watch parties & screenings)"
        placeholder="e.g. Hyderabad"
        value={city}
        onChangeText={setCity}
      />

      <Button title={`Start watching (${genres.length}/3)`} onPress={finish} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: spacing.xl, gap: spacing.xl },
  sub: { ...type.caption, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
