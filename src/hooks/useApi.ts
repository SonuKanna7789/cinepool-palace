import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";

// ── Feed ─────────────────────────────────────────
export function useFeed(page = 1, size = 20) {
  return useQuery({
    queryKey: ["feed", page, size],
    queryFn: () => api.getFeed(page, size),
  });
}

// ── Pools ────────────────────────────────────────
export function usePools(platform?: string) {
  return useQuery({
    queryKey: ["pools", platform],
    queryFn: () => api.getPools(platform),
  });
}

export function useJoinPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.joinPool(poolId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pools"] }),
  });
}

// ── Suggestions ──────────────────────────────────
export function useSuggestions() {
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: api.getSuggestions,
  });
}

// ── Profile ──────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
    enabled: api.isAuthenticated(),
  });
}

export function useWatchedMovies() {
  return useQuery({
    queryKey: ["watched"],
    queryFn: api.getWatchedMovies,
    enabled: api.isAuthenticated(),
  });
}

// ── Auth ─────────────────────────────────────────
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: api.LoginRequest) => api.login(data),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: api.RegisterRequest) => api.register(data),
    onSuccess: () => qc.invalidateQueries(),
  });
}

// ── Reviews ──────────────────────────────────────
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: api.CreateReviewRequest) => api.createReview(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
}

// ── Search ───────────────────────────────────────
export function useSearchMovies(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.searchMovies(query),
    enabled: query.length >= 2,
  });
}
