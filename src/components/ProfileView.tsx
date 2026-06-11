import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import {
  follow,
  getFollowCounts,
  getProfile,
  getTasteStats,
  isFollowing,
  unfollow,
  type TasteStats,
} from "@/api/profiles";
import { getUserReviews } from "@/api/reviews";
import { ReviewCard } from "@/components/ReviewCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stars } from "@/components/ui/Stars";
import { useAuth } from "@/providers/AuthProvider";
import { colors, radius, spacing, type } from "@/theme";
import type { FeedItem, Profile } from "@/types";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProfileView({ targetUserId }: { targetUserId: string }) {
  const { userId: myId, signOut } = useAuth();
  const isMe = myId === targetUserId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<TasteStats | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [reviews, setReviews] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [p, s, c, r, f] = await Promise.all([
        getProfile(targetUserId),
        getTasteStats(targetUserId),
        getFollowCounts(targetUserId),
        getUserReviews(targetUserId),
        isMe || !myId ? Promise.resolve(false) : isFollowing(myId, targetUserId),
      ]);
      setProfile(p);
      setStats(s);
      setCounts(c);
      setReviews(r);
      setFollowing(f);
    } catch {
      // keep stale data
    } finally {
      setRefreshing(false);
    }
  }, [targetUserId, myId, isMe]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (!myId) return;
    setFollowing((f) => !f);
    setCounts((c) => ({ ...c, followers: c.followers + (following ? -1 : 1) }));
    try {
      if (following) await unfollow(myId, targetUserId);
      else await follow(myId, targetUserId);
    } catch {
      load();
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.identityRow}>
        <Avatar profile={profile} size={72} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.title}>{profile?.display_name ?? "Cinephile"}</Text>
          {profile?.city ? <Text style={type.caption}>{profile.city}</Text> : null}
          {stats && stats.reviewCount > 0 ? (
            <View style={styles.avgRow}>
              <Stars rating={stats.avgRating} size={13} />
              <Text style={styles.avgLabel}>{stats.avgRating.toFixed(1)} avg</Text>
            </View>
          ) : null}
        </View>
      </View>

      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <View style={styles.statsRow}>
        <Stat value={stats?.reviewCount ?? 0} label="Reviews" />
        <Stat value={counts.followers} label="Followers" />
        <Stat value={counts.following} label="Following" />
      </View>

      {stats?.topGenres.length ? (
        <View style={styles.genreRow}>
          {stats.topGenres.map((g) => (
            <Chip key={g.genre} label={`${g.genre} · ${g.count}`} />
          ))}
        </View>
      ) : null}

      {isMe ? (
        <Button title="Sign out" variant="danger" size="sm" onPress={signOut} />
      ) : (
        <Button
          title={following ? "Following ✓" : "Follow"}
          variant={following ? "secondary" : "primary"}
          size="sm"
          onPress={toggleFollow}
        />
      )}

      <Text style={styles.sectionTitle}>Recent reviews</Text>
    </View>
  );

  return (
    <FlatList
      data={reviews}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.gold} />
      }
      ListHeaderComponent={header}
      ListEmptyComponent={
        refreshing ? null : (
          <EmptyState
            icon="star-outline"
            title="No reviews yet"
            subtitle={
              isMe
                ? "Your ratings build the taste profile people follow you for."
                : "This cinephile hasn't logged anything yet."
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
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  identityRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  avgRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 2 },
  avgLabel: { fontSize: 12, fontWeight: "700", color: colors.gold },
  bio: { ...type.body, fontSize: 14, color: colors.textMuted },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSolid,
    paddingVertical: spacing.lg,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.text },
  statLabel: { ...type.micro },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  sectionTitle: { ...type.heading, marginTop: spacing.sm },
});
