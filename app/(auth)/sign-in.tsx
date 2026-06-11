import { LinearGradient } from "expo-linear-gradient";
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

export default function SignIn() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (e) {
      Alert.alert("Sign in failed", (e as Error).message);
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
        <View style={styles.brand}>
          <LinearGradient
            colors={[colors.gold, colors.coral]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoEmoji}>🎬</Text>
          </LinearGradient>
          <Text style={type.hero}>CinePool Palace</Text>
          <Text style={styles.tagline}>Where cinephiles find their people.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Sign in" onPress={onSubmit} loading={busy} />
        </View>

        <Text style={styles.footer}>
          New here?{" "}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Create an account
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: spacing.xl, gap: spacing.xxl },
  brand: { alignItems: "center", gap: spacing.sm },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 40 },
  tagline: { ...type.caption, fontSize: 14 },
  form: { gap: spacing.lg },
  footer: { ...type.caption, textAlign: "center", fontSize: 14 },
  link: { color: colors.gold, fontWeight: "700" },
});
