import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";
import movie3 from "@/assets/movie-3.jpg";
import movie4 from "@/assets/movie-4.jpg";
import movie5 from "@/assets/movie-5.jpg";

export type OttPlatform = "netflix" | "prime" | "disney" | "hbo";

export interface FeedPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    isEnthusiast: boolean;
  };
  movie: {
    id?: string;
    title: string;
    year: number;
    poster: string;
    genre: string;
    rating: number;
    platforms: OttPlatform[];
  };
  review: string;
  boostedBy?: {
    name: string;
    avatar: string;
    comment: string;
  };
  likes: number;
  comments: number;
  timeAgo: string;
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

export interface Suggestion {
  id: string;
  movie: {
    title: string;
    year: number;
    poster: string;
    genre: string;
    director: string;
    platforms: OttPlatform[];
  };
  matchPercent: number;
  reason: string;
}

export interface WatchedMovie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  watchedDate: string;
}

export const feedPosts: FeedPost[] = [
  {
    id: "1",
    user: { name: "Mira Chen", avatar: "MC", isEnthusiast: true },
    movie: {
      title: "Echoes of Nebula",
      year: 2025,
      poster: movie1,
      genre: "Sci-Fi Thriller",
      rating: 4.5,
      platforms: ["netflix", "prime"],
    },
    review: "A stunning visual odyssey that redefines what sci-fi can feel like. The sound design alone is worth the watch — every frame pulses with life.",
    likes: 342,
    comments: 47,
    timeAgo: "2h ago",
  },
  {
    id: "2",
    user: { name: "Arjun Patel", avatar: "AP", isEnthusiast: false },
    movie: {
      title: "Golden Hours",
      year: 2024,
      poster: movie2,
      genre: "Drama",
      rating: 4.2,
      platforms: ["prime"],
    },
    review: "A quiet, devastating masterpiece. This film understands loneliness better than most novels I've read.",
    boostedBy: {
      name: "Film Diary",
      avatar: "FD",
      comment: "Arjun nailed it. This one stays with you for days.",
    },
    likes: 218,
    comments: 31,
    timeAgo: "5h ago",
  },
  {
    id: "3",
    user: { name: "Yuki Tanaka", avatar: "YT", isEnthusiast: true },
    movie: {
      title: "Sakura Station",
      year: 2025,
      poster: movie3,
      genre: "Animation",
      rating: 4.8,
      platforms: ["disney", "netflix"],
    },
    review: "Miyazaki vibes but entirely its own thing. The train station sequence had me in tears. Japanese cinema is unmatched.",
    likes: 891,
    comments: 124,
    timeAgo: "8h ago",
  },
  {
    id: "4",
    user: { name: "Leo Moretti", avatar: "LM", isEnthusiast: false },
    movie: {
      title: "Neon Shadows",
      year: 2024,
      poster: movie4,
      genre: "Crime Noir",
      rating: 3.9,
      platforms: ["hbo"],
    },
    review: "Raw, gritty, unapologetically dark. If you loved Se7en, this is your next obsession.",
    likes: 156,
    comments: 22,
    timeAgo: "12h ago",
  },
];

export const pools: Pool[] = [
  { id: "1", platform: "netflix", creator: "Alex R.", plan: "Premium 4K", pricePerSlot: "$4.50/mo", filledSlots: 2, totalSlots: 4, country: "US", expiresIn: "28 days" },
  { id: "2", platform: "disney", creator: "Sarah K.", plan: "Bundle Plan", pricePerSlot: "$3.25/mo", filledSlots: 3, totalSlots: 4, country: "US", expiresIn: "15 days" },
  { id: "3", platform: "hbo", creator: "Marcus T.", plan: "Ad-Free", pricePerSlot: "$5.00/mo", filledSlots: 1, totalSlots: 4, country: "US", expiresIn: "30 days" },
  { id: "4", platform: "prime", creator: "Priya M.", plan: "Annual Split", pricePerSlot: "$2.75/mo", filledSlots: 2, totalSlots: 4, country: "US", expiresIn: "45 days" },
  { id: "5", platform: "netflix", creator: "Jordan L.", plan: "Standard", pricePerSlot: "$3.50/mo", filledSlots: 1, totalSlots: 3, country: "US", expiresIn: "20 days" },
];

export const suggestions: Suggestion[] = [
  {
    id: "1",
    movie: {
      title: "Sakura Station",
      year: 2025,
      poster: movie3,
      genre: "Animation",
      director: "Kenji Yamamoto",
      platforms: ["disney", "netflix"],
    },
    matchPercent: 98,
    reason: "Based on your love for Japanese Cinema",
  },
  {
    id: "2",
    movie: {
      title: "Echoes of Nebula",
      year: 2025,
      poster: movie1,
      genre: "Sci-Fi Thriller",
      director: "Elena Vasquez",
      platforms: ["netflix", "prime"],
    },
    matchPercent: 91,
    reason: "Similar to films you rated 5 stars",
  },
  {
    id: "3",
    movie: {
      title: "The Last Fortress",
      year: 2025,
      poster: movie5,
      genre: "Fantasy Adventure",
      director: "Raj Kapoor",
      platforms: ["hbo"],
    },
    matchPercent: 85,
    reason: "Trending in your genre preferences",
  },
];

export const watchedMovies: WatchedMovie[] = [
  { id: "1", title: "Echoes of Nebula", poster: movie1, rating: 5, watchedDate: "Feb 10, 2026" },
  { id: "2", title: "Golden Hours", poster: movie2, rating: 4, watchedDate: "Feb 5, 2026" },
  { id: "3", title: "Sakura Station", poster: movie3, rating: 5, watchedDate: "Jan 28, 2026" },
  { id: "4", title: "Neon Shadows", poster: movie4, rating: 3, watchedDate: "Jan 20, 2026" },
  { id: "5", title: "The Last Fortress", poster: movie5, rating: 4, watchedDate: "Jan 12, 2026" },
];

export const platformNames: Record<OttPlatform, string> = {
  netflix: "Netflix",
  prime: "Prime Video",
  disney: "Disney+",
  hbo: "HBO Max",
};

export const platformColors: Record<OttPlatform, string> = {
  netflix: "bg-netflix",
  prime: "bg-prime",
  disney: "bg-disney",
  hbo: "bg-hbo",
};
