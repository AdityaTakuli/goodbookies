-- Phase 1: Football player cards (Spotify-style public profiles + owner-verified stats)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS city text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- Sport card (playlist) — Phase 1: football only
CREATE TABLE public.player_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_slug text NOT NULL DEFAULT 'football' CHECK (sport_slug = 'football'),
  club_id text,
  flag_id text,
  position text,
  jersey_number smallint CHECK (jersey_number IS NULL OR (jersey_number >= 1 AND jersey_number <= 99)),
  preferred_foot text CHECK (preferred_foot IS NULL OR preferred_foot IN ('left', 'right', 'both')),
  -- Self-reported stats (player-editable only; visually distinct on card)
  goals_self integer NOT NULL DEFAULT 0 CHECK (goals_self >= 0),
  assists_self integer NOT NULL DEFAULT 0 CHECK (assists_self >= 0),
  matches_self integer NOT NULL DEFAULT 0 CHECK (matches_self >= 0),
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sport_slug)
);

CREATE INDEX player_cards_user_id_idx ON public.player_cards (user_id);

ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public football cards readable"
  ON public.player_cards FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND sport_slug = 'football');

CREATE POLICY "Users read own cards"
  ON public.player_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own cards"
  ON public.player_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND sport_slug = 'football');

CREATE POLICY "Users update own cards"
  ON public.player_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND sport_slug = 'football');

CREATE POLICY "Admins manage player cards"
  ON public.player_cards FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Turf-verified stats — separate write path (owners only via server functions)
CREATE TABLE public.player_verified_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_slug text NOT NULL DEFAULT 'football' CHECK (sport_slug = 'football'),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  verified_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_date date NOT NULL DEFAULT CURRENT_DATE,
  goals integer NOT NULL DEFAULT 0 CHECK (goals >= 0),
  assists integer NOT NULL DEFAULT 0 CHECK (assists >= 0),
  matches integer NOT NULL DEFAULT 1 CHECK (matches >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX player_verified_stats_player_idx
  ON public.player_verified_stats (player_user_id, sport_slug, created_at DESC);

ALTER TABLE public.player_verified_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified stats public read"
  ON public.player_verified_stats FOR SELECT
  TO anon, authenticated
  USING (sport_slug = 'football');

CREATE POLICY "Admins manage verified stats"
  ON public.player_verified_stats FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow public read of profiles with username for artist-style pages
CREATE POLICY "Public profiles by username"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL AND is_banned = false);
