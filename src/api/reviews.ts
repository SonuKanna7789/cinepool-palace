import { supabase } from "@/lib/supabase";
import { fetchMovie, posterUrl } from "@/lib/tmdb";
import type { FeedItem, MovieRow, Review } from "@/types";
import { getProfilesByIds } from "./profiles";

async function getMoviesByIds(movieIds: string[]): Promise<Map<string, MovieRow>> {
  if (movieIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("movies")
    .select("id, title, poster_path, backdrop_path, overview, release_date, genres, vote_average")
    .in("id", [...new Set(movieIds)]);
  if (error) throw error;
  return new Map((data ?? []).map((m: MovieRow) => [m.id, m]));
}

async function hydrate(reviews: Review[]): Promise<FeedItem[]> {
  const [profiles, movies] = await Promise.all([
    getProfilesByIds(reviews.map((r) => r.user_id)),
    getMoviesByIds(reviews.map((r) => r.movie_id)),
  ]);
  return reviews.map((r) => ({
    ...r,
    profile: profiles.get(r.user_id) ?? null,
    movie: movies.get(r.movie_id) ?? null,
  }));
}

export async function getFeed(opts: { followingOnly?: boolean; userId?: string } = {}): Promise<FeedItem[]> {
  let userFilter: string[] | null = null;
  if (opts.followingOnly && opts.userId) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", opts.userId);
    userFilter = (follows ?? []).map((f: { following_id: string }) => f.following_id);
    if (userFilter.length === 0) return [];
  }

  let query = supabase
    .from("user_reviews")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);
  if (userFilter) query = query.in("user_id", userFilter);

  const { data, error } = await query;
  if (error) throw error;
  return hydrate(data ?? []);
}

export async function getUserReviews(userId: string): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from("user_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return hydrate(data ?? []);
}

// Cache the TMDB movie into our `movies` table so feeds can render posters
// without hitting TMDB, then upsert the review.
export async function submitReview(input: {
  userId: string;
  movieId: string;
  rating: number;
  reviewText?: string;
  platform?: string;
}) {
  const movie = await fetchMovie(input.movieId);
  await supabase.from("movies").upsert({
    id: String(movie.id),
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date || null,
    runtime: movie.runtime,
    genres: movie.genres?.map((g) => g.name) ?? [],
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
  });

  const { error } = await supabase.from("user_reviews").upsert(
    {
      user_id: input.userId,
      movie_id: input.movieId,
      rating: input.rating,
      review_text: input.reviewText || null,
      platform_watched: input.platform || null,
      is_public: true,
    },
    { onConflict: "user_id,movie_id" }
  );
  if (error) {
    // Older projects may lack the unique constraint; fall back to plain insert.
    const { error: insertError } = await supabase.from("user_reviews").insert({
      user_id: input.userId,
      movie_id: input.movieId,
      rating: input.rating,
      review_text: input.reviewText || null,
      platform_watched: input.platform || null,
      is_public: true,
    });
    if (insertError) throw insertError;
  }
}

export { posterUrl };
