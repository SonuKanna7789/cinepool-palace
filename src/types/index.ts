export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  is_onboarded: boolean;
};

export type Review = {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  review_text: string | null;
  platform_watched: string | null;
  is_public: boolean;
  created_at: string;
};

export type MovieRow = {
  id: string;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date: string | null;
  genres: string[] | null;
  vote_average: number | null;
};

export type FeedItem = Review & {
  profile: Profile | null;
  movie: MovieRow | null;
};

export type Crew = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  emoji: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
};

export type CrewMessage = {
  id: string;
  crew_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Profile | null;
};

export type WatchParty = {
  id: string;
  crew_id: string;
  movie_id: string;
  movie_title: string;
  poster_path: string | null;
  cinema_name: string;
  city: string | null;
  starts_at: string;
  notes: string | null;
  created_by: string;
  rsvp_count?: number;
  my_rsvp?: "in" | "maybe" | "out" | null;
};

export type ScreeningRequest = {
  id: string;
  movie_id: string;
  movie_title: string;
  poster_path: string | null;
  cinema_name: string;
  city: string;
  pitch: string | null;
  status: "open" | "accepted" | "declined";
  created_by: string;
  created_at: string;
  vote_count?: number;
  has_voted?: boolean;
};
