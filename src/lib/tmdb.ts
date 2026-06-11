import { supabase } from "./supabase";

export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
};

export const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export function posterUrl(path: string | null | undefined, size: "w342" | "w500" | "w780" = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined;
}

export function backdropUrl(path: string | null | undefined) {
  return path ? `https://image.tmdb.org/t/p/w780${path}` : undefined;
}

// All TMDB traffic goes through the tmdb-proxy edge function so the API key
// stays server-side.
async function tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("tmdb-proxy", {
    body: { endpoint, params },
  });
  if (error) throw error;
  return data as T;
}

type Paged = { results: TmdbMovie[] };

export const fetchTrending = () =>
  tmdb<Paged>("/trending/movie/week").then((d) => d.results);

export const fetchNowPlaying = () =>
  tmdb<Paged>("/movie/now_playing").then((d) => d.results);

export const fetchTopRated = () =>
  tmdb<Paged>("/movie/top_rated").then((d) => d.results);

export const searchMovies = (query: string) =>
  tmdb<Paged>("/search/movie", { query }).then((d) => d.results);

export const fetchMovie = (id: string | number) =>
  tmdb<TmdbMovie & { runtime: number | null; genres: { id: number; name: string }[] }>(
    `/movie/${id}`
  );
