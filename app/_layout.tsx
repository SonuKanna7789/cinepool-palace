import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "@/theme";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "700" },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="movie/[id]" options={{ title: "", headerTransparent: true }} />
          <Stack.Screen name="user/[id]" options={{ title: "Profile" }} />
          <Stack.Screen name="crew/[id]" options={{ title: "Crew" }} />
          <Stack.Screen name="crew/new" options={{ title: "New Crew", presentation: "modal" }} />
          <Stack.Screen name="party/new" options={{ title: "Plan a Watch Party", presentation: "modal" }} />
          <Stack.Screen name="screening/new" options={{ title: "Request a Screening", presentation: "modal" }} />
          <Stack.Screen name="review/[movieId]" options={{ title: "Log & Review", presentation: "modal" }} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
