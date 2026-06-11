import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { getFeed } from "@/api/reviews";
import { ReviewCard } from "@/components/ReviewCard";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing } from "@/theme";
import type { FeedItem } from "@/types";

export default function FeedScreen() {
  const { userId } = useAuth();
  const [scope, setScope] = useState<"everyone" | "following">("everyone");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      setItems(await getFeed({ followingOnly: scope === "following", userId }));
    } catch {
      // keep stale items on transient failures
    } finally {
      setRefreshing(false);
    }
  }, [scope, userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.gold} />
      }
      ListHeaderComponent={
        <View style={styles.scopeRow}>
          <Chip label="Everyone" active={scope === "everyone"} onPress={() => setScope("everyone")} />
          <Chip label="Following" active={scope === "following"} onPress={() => setScope("following")} />
        </View>
      }
      ListEmptyComponent={
        refreshing ? null : (
          <EmptyState
            icon="film-outline"
            title={scope === "following" ? "Nothing from your people yet" : "No reviews yet"}
            subtitle={
              scope === "following"
                ? "Follow cinephiles whose taste you trust — their reviews will land here."
                : "Be the first: find a movie in Discover and log what you thought."
            }
          />
        )
      }
      renderItem={({ item }) => <ReviewCard item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  scopeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
});
