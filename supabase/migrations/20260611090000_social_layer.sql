-- ============================================================
-- CinePool Palace — social layer
-- Adds: profile fields, follows, crews (groups), crew chat,
-- watch parties (cinema meetups), screening requests + votes.
-- Idempotent: safe to run on a fresh project or the existing one.
-- ============================================================

-- ---------- profiles: social fields ----------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (lower(username)) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key
  ON public.profiles (user_id);

-- Profiles are public: taste profiles are the core of the network.
DO $$ BEGIN
  CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Public reviews power the social feed.
DO $$ BEGIN
  CREATE POLICY "Public reviews are viewable by everyone"
    ON public.user_reviews FOR SELECT TO authenticated USING (is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- follows ----------
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Follow graph is public"
    ON public.follows FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users follow as themselves"
    ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users unfollow as themselves"
    ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- crews (movie groups) ----------
CREATE TABLE IF NOT EXISTS public.crews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  city        text,
  emoji       text NOT NULL DEFAULT '🎬',
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crew_members (
  crew_id   uuid NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (crew_id, user_id)
);
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Crews are discoverable"
    ON public.crews FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users create crews as themselves"
    ON public.crews FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Owners update their crews"
    ON public.crews FOR UPDATE TO authenticated USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Owners delete their crews"
    ON public.crews FOR DELETE TO authenticated USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Memberships are visible"
    ON public.crew_members FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users join crews as themselves"
    ON public.crew_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users leave crews; owners remove members"
    ON public.crew_members FOR DELETE TO authenticated
    USING (
      auth.uid() = user_id
      OR auth.uid() = (SELECT created_by FROM public.crews WHERE id = crew_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- crew chat ----------
CREATE TABLE IF NOT EXISTS public.crew_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id    uuid NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crew_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS crew_messages_crew_idx ON public.crew_messages (crew_id, created_at);

DO $$ BEGIN
  CREATE POLICY "Members read crew chat"
    ON public.crew_messages FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.crew_members m
      WHERE m.crew_id = crew_messages.crew_id AND m.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Members write crew chat"
    ON public.crew_messages FOR INSERT TO authenticated
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1 FROM public.crew_members m
        WHERE m.crew_id = crew_messages.crew_id AND m.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- watch parties (meet at a cinema) ----------
CREATE TABLE IF NOT EXISTS public.watch_parties (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id     uuid NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  movie_id    text NOT NULL,
  movie_title text NOT NULL,
  poster_path text,
  cinema_name text NOT NULL,
  city        text,
  starts_at   timestamptz NOT NULL,
  notes       text,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.watch_parties ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS watch_parties_crew_idx ON public.watch_parties (crew_id, starts_at);

CREATE TABLE IF NOT EXISTS public.party_rsvps (
  party_id   uuid NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status     text NOT NULL DEFAULT 'in' CHECK (status IN ('in', 'maybe', 'out')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (party_id, user_id)
);
ALTER TABLE public.party_rsvps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Parties are visible"
    ON public.watch_parties FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Crew members plan parties"
    ON public.watch_parties FOR INSERT TO authenticated
    WITH CHECK (
      auth.uid() = created_by
      AND EXISTS (
        SELECT 1 FROM public.crew_members m
        WHERE m.crew_id = watch_parties.crew_id AND m.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Hosts update their parties"
    ON public.watch_parties FOR UPDATE TO authenticated USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Hosts cancel their parties"
    ON public.watch_parties FOR DELETE TO authenticated USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "RSVPs are visible"
    ON public.party_rsvps FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users RSVP as themselves"
    ON public.party_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users change their RSVP"
    ON public.party_rsvps FOR UPDATE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users withdraw their RSVP"
    ON public.party_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- screening requests (ask cinemas for special screenings) ----------
CREATE TABLE IF NOT EXISTS public.screening_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id    text NOT NULL,
  movie_title text NOT NULL,
  poster_path text,
  cinema_name text NOT NULL,
  city        text NOT NULL,
  pitch       text,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'declined')),
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.screening_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.screening_votes (
  request_id uuid NOT NULL REFERENCES public.screening_requests(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (request_id, user_id)
);
ALTER TABLE public.screening_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Screening requests are visible"
    ON public.screening_requests FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users open requests as themselves"
    ON public.screening_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Creators update their requests"
    ON public.screening_requests FOR UPDATE TO authenticated USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Creators withdraw their requests"
    ON public.screening_requests FOR DELETE TO authenticated USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Votes are visible"
    ON public.screening_votes FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users vote as themselves"
    ON public.screening_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users retract their vote"
    ON public.screening_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- realtime for crew chat ----------
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crew_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
