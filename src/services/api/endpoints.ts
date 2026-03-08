import { apiClient, setToken } from "./client";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  FeedResponse,
  Pool,
  Suggestion,
  UserProfile,
  WatchedMovie,
  CreateReviewRequest,
  BoostRequest,
  UserPreferences,
  Movie,
  Review,
} from "./types";

// ── Auth ─────────────────────────────────────────
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
  setToken(res.accessToken);
  return res;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
  setToken(res.accessToken);
  return res;
}

// ── Feed ─────────────────────────────────────────
export function getFeed(page = 1, size = 20): Promise<FeedResponse> {
  return apiClient<FeedResponse>(`/feed?page=${page}&size=${size}`);
}

// ── Movies ───────────────────────────────────────
export function searchMovies(query: string): Promise<Movie[]> {
  return apiClient<Movie[]>(`/movies/search?q=${encodeURIComponent(query)}`);
}

export function getMovie(id: string): Promise<Movie> {
  return apiClient<Movie>(`/movies/${id}`);
}

// ── Reviews ──────────────────────────────────────
export function createReview(data: CreateReviewRequest): Promise<Review> {
  return apiClient<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function boostReview(data: BoostRequest): Promise<void> {
  return apiClient<void>("/boosts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Pools ────────────────────────────────────────
export function getPools(platform?: string): Promise<Pool[]> {
  const params = platform && platform !== "all" ? `?platform=${platform}` : "";
  return apiClient<Pool[]>(`/pools${params}`);
}

export function joinPool(poolId: string): Promise<void> {
  return apiClient<void>(`/pools/${poolId}/join`, { method: "POST" });
}

// ── Profile ──────────────────────────────────────
export function getProfile(): Promise<UserProfile> {
  return apiClient<UserProfile>("/profile");
}

export function getWatchedMovies(): Promise<WatchedMovie[]> {
  return apiClient<WatchedMovie[]>("/profile/watched");
}

export function getPreferences(): Promise<UserPreferences> {
  return apiClient<UserPreferences>("/profile/preferences");
}

export function updatePreferences(data: UserPreferences): Promise<UserPreferences> {
  return apiClient<UserPreferences>("/profile/preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Suggestions ──────────────────────────────────
export function getSuggestions(): Promise<Suggestion[]> {
  return apiClient<Suggestion[]>("/suggestions");
}
