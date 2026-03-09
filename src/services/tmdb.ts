import { supabase } from "@/integrations/supabase/client";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
}

// Cache for TMDB posters to avoid duplicate API calls
const posterCache = new Map<string, string>();

export async function getTMDBPoster(movieTitle: string, year?: number): Promise<string> {
  const cacheKey = `${movieTitle}-${year || ""}`;
  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey)!;
  }

  try {
    const yearParam = year ? `&year=${year}` : "";
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(movieTitle)}${yearParam}&api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      if (movie.poster_path) {
        const posterUrl = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
        posterCache.set(cacheKey, posterUrl);
        return posterUrl;
      }
    }
  } catch (err) {
    console.error("TMDB poster fetch error:", err);
  }

  // Fallback: gradient with movie title
  return "";
}

export async function searchTMDBMovies(query: string): Promise<TMDBMovie[]> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("TMDB search error:", err);
    return [];
  }
}

export async function searchTMDBTV(query: string): Promise<any[]> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("TMDB TV search error:", err);
    return [];
  }
}

export async function getSuggestions(userId: string, forceRefresh: boolean = false) {
  try {
    const { data, error } = await supabase.functions.invoke("generate-suggestions", {
      body: { user_id: userId, force_refresh: forceRefresh },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Suggestions error:", err);
    throw err;
  }
}

export async function submitSuggestionFeedback(userId: string, movieId: string, action: string) {
  try {
    const { error } = await supabase.from("suggestion_feedback").insert({
      user_id: userId,
      movie_id: movieId,
      action,
    });

    if (error) throw error;
  } catch (err) {
    console.error("Suggestion feedback error:", err);
    throw err;
  }
}
