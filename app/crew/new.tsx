import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { createCrew } from "@/api/crews";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import { spacing, type } from "@/theme";

const EMOJIS = ["🎬", "🍿", "🎞️", "👻", "🚀", "💘", "🕵️", "🤠", "🧛", "🤖"];

export default function NewCrewScreen() {
  const { userId } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [emoji, setEmoji] = useState("🎬");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!userId || !name.trim()) {
      Alert.alert("Name your crew", "Every crew needs a name.");
      return;
    }
    setBusy(true);
    try {
      const id = await createCrew({
        userId,
        name: name.trim(),
        description: description.trim() || undefined,
        city: city.trim() || undefined,
        emoji,
      });
      router.replace({ pathname: "/crew/[id]", params: { id } });
    } catch (e) {
      Alert.alert("Could not create crew", (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Input label="Crew name" placeholder="Midnight Horror Club" value={name} onChangeText={setName} />
      <Input
        label="What's this crew about?"
        placeholder="We watch what others won't…"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Input label="City" placeholder="Where do you meet?" value={city} onChangeText={setCity} />
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.micro, { marginLeft: spacing.xs }]}>Crew badge</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <Chip key={e} label={e} active={emoji === e} onPress={() => setEmoji(e)} />
          ))}
        </View>
      </View>
      <Button title="Create crew" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.lg },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
