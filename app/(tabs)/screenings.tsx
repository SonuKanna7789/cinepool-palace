import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getScreeningRequests, toggleVote } from "@/api/screenings";
import { ScreeningCard } from "@/components/ScreeningCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, type } from "@/theme";
import type { ScreeningRequest } from "@/types";

export default function ScreeningsScreen() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<ScreeningRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      setRequests(await getScreeningRequests(userId));
    } catch {
      // keep stale list
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const vote = async (request: ScreeningRequest) => {
    if (!userId) return;
    // optimistic flip
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              has_voted: !r.has_voted,
              vote_count: (r.vote_count ?? 0) + (r.has_voted ? -1 : 1),
            }
          : r
      )
    );
    try {
      await toggleVote(request.id, userId, !!request.has_voted);
    } catch {
      load();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.gold} />
        }
        ListHeaderComponent={
          <Text style={styles.blurb}>
            Rally votes for the films you want back on the big screen — then take the demand to
            your local cinema.
          </Text>
        }
        ListEmptyComponent={
          refreshing ? null : (
            <EmptyState
              icon="ticket-outline"
              title="No screening campaigns yet"
              subtitle="Request a rewatch of a classic at a cinema near you and gather the crowd."
            />
          )
        }
        renderItem={({ item }) => <ScreeningCard request={item} onVote={() => vote(item)} />}
      />
      <Pressable style={styles.fab} onPress={() => router.push("/screening/new")}>
        <Ionicons name="add" size={28} color="#1A1404" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 100 },
  blurb: { ...type.caption, fontSize: 13, lineHeight: 19, marginBottom: spacing.lg },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
