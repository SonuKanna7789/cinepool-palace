export type OttPlatform = "netflix" | "prime" | "disney" | "hbo";

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isEnthusiast: boolean;
  watchedCount: number;
  reviewCount: number;
  totalSaved: number;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  genre: string;
  director: string;
  rating: number;
  platforms: OttPlatform[];
}

export interface Review {
  id: string;
  userId: string;
  user: { name: string; avatar: string; isEnthusiast: boolean };
  movieId: string;
  movie: Movie;
  text: string;
  rating: number;
  createdAt: string;
  likes: number;
  comments: number;
  boost?: { name: string; avatar: string; comment: string };
}

export interface FeedResponse {
  items: Review[];
  page: number;
  totalPages: number;
}

export interface Pool {
  id: string;
  platform: OttPlatform;
  creator: string;
  plan: string;
  pricePerSlot: string;
  filledSlots: number;
  totalSlots: number;
  country: string;
  expiresIn: string;
}

export interface WatchedMovie {
  id: string;
  title: string;
  posterUrl: string;
  rating: number;
  watchedDate: string;
}

export interface Suggestion {
  id: string;
  movie: Movie;
  matchPercent: number;
  reason: string;
}

export interface CreateReviewRequest {
  movieId: string;
  text: string;
  rating: number;
}

export interface BoostRequest {
  reviewId: string;
  comment: string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  favoritePlatforms: OttPlatform[];
}
