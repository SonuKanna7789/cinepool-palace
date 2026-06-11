import { supabase } from "@/lib/supabase";
import type { ScreeningRequest } from "@/types";

export async function getScreeningRequests(userId: string): Promise<ScreeningRequest[]> {
  const [{ data: requests, error }, { data: votes }] = await Promise.all([
    supabase.from("screening_requests").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("screening_votes").select("request_id, user_id"),
  ]);
  if (error) throw error;

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const v of votes ?? []) {
    counts.set(v.request_id, (counts.get(v.request_id) ?? 0) + 1);
    if (v.user_id === userId) mine.add(v.request_id);
  }
  return (requests ?? [])
    .map((r: ScreeningRequest) => ({
      ...r,
      vote_count: counts.get(r.id) ?? 0,
      has_voted: mine.has(r.id),
    }))
    .sort((a: ScreeningRequest, b: ScreeningRequest) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
}

export async function createScreeningRequest(input: {
  userId: string;
  movieId: string;
  movieTitle: string;
  posterPath: string | null;
  cinemaName: string;
  city: string;
  pitch?: string;
}) {
  const { data, error } = await supabase
    .from("screening_requests")
    .insert({
      movie_id: input.movieId,
      movie_title: input.movieTitle,
      poster_path: input.posterPath,
      cinema_name: input.cinemaName,
      city: input.city,
      pitch: input.pitch || null,
      created_by: input.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  await supabase.from("screening_votes").insert({ request_id: data.id, user_id: input.userId });
}

export async function toggleVote(requestId: string, userId: string, hasVoted: boolean) {
  if (hasVoted) {
    const { error } = await supabase
      .from("screening_votes")
      .delete()
      .eq("request_id", requestId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("screening_votes")
      .insert({ request_id: requestId, user_id: userId });
    if (error) throw error;
  }
}
