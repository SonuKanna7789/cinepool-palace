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
import { getCrews, joinCrew } from "@/api/crews";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { colors, radius, spacing, type } from "@/theme";
import type { Crew } from "@/types";

function CrewRow({ crew, onJoin }: { crew: Crew; onJoin: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: "/crew/[id]", params: { id: crew.id } })}
    >
      <View style={styles.emojiWrap}>
        <Text style={{ fontSize: 26 }}>{crew.emoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name}>{crew.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {crew.member_count} member{crew.member_count === 1 ? "" : "s"}
          {crew.city ? ` · ${crew.city}` : ""}
        </Text>
        {crew.description ? (
          <Text style={styles.desc} numberOfLines={1}>{crew.description}</Text>
        ) : null}
      </View>
      {crew.is_member ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      ) : (
        <Pressable style={styles.joinBtn} onPress={onJoin} hitSlop={6}>
          <Text style={styles.joinLabel}>Join</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export default function CrewsScreen() {
  const { userId } = useAuth();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      setCrews(await getCrews(userId));
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

  const join = async (crew: Crew) => {
    if (!userId) return;
    try {
      await joinCrew(crew.id, userId);
      load();
    } catch {
      // RLS or duplicate join; refresh shows truth
      load();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={crews}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.gold} />
        }
        ListEmptyComponent={
          refreshing ? null : (
            <EmptyState
              icon="people-outline"
              title="No crews yet"
              subtitle="Start one — pick a name, invite your people, and plan your first cinema night."
            />
          )
        }
        renderItem={({ item }) => <CrewRow crew={item} onJoin={() => join(item)} />}
      />
      <Pressable style={styles.fab} onPress={() => router.push("/crew/new")}>
        <Ionicons name="add" size={28} color="#1A1404" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...type.heading, fontSize: 16 },
  meta: { ...type.caption, fontSize: 12 },
  desc: { ...type.caption, fontSize: 12, color: colors.textFaint },
  joinBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  joinLabel: { fontSize: 12, fontWeight: "800", color: "#1A1404" },
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
