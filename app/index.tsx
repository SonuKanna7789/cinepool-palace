import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme";

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (profile && !profile.is_onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
