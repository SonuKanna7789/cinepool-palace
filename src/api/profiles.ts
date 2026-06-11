import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfilesByIds(userIds: string[]): Promise<Map<string, Profile>> {
  if (userIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", [...new Set(userIds)]);
  if (error) throw error;
  return new Map((data ?? []).map((p: Profile) => [p.user_id, p]));
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
  if (error) throw error;
}

export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

export async function isFollowing(me: string, them: string): Promise<boolean> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", me)
    .eq("following_id", them);
  return (count ?? 0) > 0;
}

export async function follow(me: string, them: string) {
  const { error } = await supabase.from("follows").insert({ follower_id: me, following_id: them });
  if (error) throw error;
}

export async function unfollow(me: string, them: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", me)
    .eq("following_id", them);
  if (error) throw error;
}

export type TasteStats = {
  reviewCount: number;
  avgRating: number;
  topGenres: { genre: string; count: number }[];
};

// The taste profile shown on a user's page: how much they review, how harsh
// they rate, and which genres dominate their watch history.
export async function getTasteStats(userId: string): Promise<TasteStats> {
  const { data: reviews, error } = await supabase
    .from("user_reviews")
    .select("rating, movie_id")
    .eq("user_id", userId);
  if (error) throw error;

  const rows = reviews ?? [];
  const avg = rows.length
    ? rows.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / rows.length
    : 0;

  const movieIds = rows.map((r: { movie_id: string }) => r.movie_id);
  const genreCounts = new Map<string, number>();
  if (movieIds.length) {
    const { data: movies } = await supabase
      .from("movies")
      .select("id, genres")
      .in("id", movieIds.slice(0, 200));
    for (const m of movies ?? []) {
      for (const g of m.genres ?? []) {
        genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      }
    }
  }
  const topGenres = [...genreCounts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { reviewCount: rows.length, avgRating: avg, topGenres };
}
