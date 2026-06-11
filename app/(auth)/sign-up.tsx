import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, type } from "@/theme";

export default function SignUp() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert("Almost there", "Fill in your name, email and a password of 6+ characters.");
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace("/");
    } catch (e) {
      Alert.alert("Sign up failed", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.xxl * 2, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={type.hero}>Join the pool</Text>
          <Text style={styles.tagline}>
            Rate films, build your taste profile, and meet people who watch like you.
          </Text>
        </View>

        <View style={styles.form}>
          <Input label="Display name" placeholder="Pauline K." value={name} onChangeText={setName} />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="6+ characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Create account" onPress={onSubmit} loading={busy} />
        </View>

        <Text style={styles.footer}>
          Already a member?{" "}
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: spacing.xl, gap: spacing.xxl },
  heading: { gap: spacing.sm },
  tagline: { ...type.caption, fontSize: 14, lineHeight: 20 },
  form: { gap: spacing.lg },
  footer: { ...type.caption, textAlign: "center", fontSize: 14 },
  link: { color: colors.gold, fontWeight: "700" },
});
