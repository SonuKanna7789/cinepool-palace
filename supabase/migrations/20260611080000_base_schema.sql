-- ============================================================
-- CinePool Palace — base schema
-- Run this FIRST (before 20260611090000_social_layer.sql).
-- Creates: profiles (+ auto-create trigger), movies cache,
-- user_reviews, user_preferences, user_watch_history,
-- user_favorite_movies, suggestion_feedback — all with RLS.
-- Idempotent: safe to re-run.
-- ============================================================

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  is_onboarded boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users insert own profile"
    ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own profile"
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Auto-create a profile row whenever a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------- movies (TMDB cache) ----------
CREATE TABLE IF NOT EXISTS public.movies (
  id            text PRIMARY KEY,           -- TMDB id as text
  title         text NOT NULL,
  overview      text,
  poster_path   text,
  backdrop_path text,
  release_date  date,
  runtime       integer,
  director      text,
  genre_ids     integer[],
  genres        text[],
  vote_average  numeric,
  vote_count    integer,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Movies are viewable by everyone"
    ON public.movies FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert movies"
    ON public.movies FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Upserting a cached movie needs UPDATE on conflict.
DO $$ BEGIN
  CREATE POLICY "Authenticated users can refresh movies"
    ON public.movies FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- user_reviews ----------
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id         text NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  rating           numeric NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text      text,
  platform_watched text,
  is_public        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)                 -- one review per user per movie
);
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS user_reviews_feed_idx ON public.user_reviews (created_at DESC);

DO $$ BEGIN
  CREATE POLICY "Users read own reviews"
    ON public.user_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert own reviews"
    ON public.user_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own reviews"
    ON public.user_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users delete own reviews"
    ON public.user_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- user_preferences ----------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_genres     text[] NOT NULL DEFAULT '{}',
  favorite_platforms  text[] NOT NULL DEFAULT '{}',
  preferred_languages text[] NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own preferences"
    ON public.user_preferences FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- user_watch_history ----------
CREATE TABLE IF NOT EXISTS public.user_watch_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id    text NOT NULL,
  movie_title text NOT NULL,
  genre       text,
  rating      numeric,
  watched_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own watch history"
    ON public.user_watch_history FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- user_favorite_movies ----------
CREATE TABLE IF NOT EXISTS public.user_favorite_movies (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id text NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);
ALTER TABLE public.user_favorite_movies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own favorites"
    ON public.user_favorite_movies FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- suggestion_feedback ----------
CREATE TABLE IF NOT EXISTS public.suggestion_feedback (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id   text NOT NULL,
  action     text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suggestion_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users insert own feedback"
    ON public.suggestion_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users read own feedback"
    ON public.suggestion_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
