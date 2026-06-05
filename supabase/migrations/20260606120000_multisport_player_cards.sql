-- Multi-sport "My Bookies" player cards (Football, Cricket, Basketball, Badminton)
-- Stats are turf-verified only; players edit aesthetics (club, position, ratings, bio).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_inventory_id text;

-- Expand player_cards beyond football
ALTER TABLE public.player_cards DROP CONSTRAINT IF EXISTS player_cards_sport_slug_check;
ALTER TABLE public.player_cards
  DROP COLUMN IF EXISTS goals_self,
  DROP COLUMN IF EXISTS assists_self,
  DROP COLUMN IF EXISTS matches_self;

ALTER TABLE public.player_cards
  ADD COLUMN IF NOT EXISTS card_ratings jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sport_settings jsonb NOT NULL DEFAULT '{}';

ALTER TABLE public.player_cards
  ADD CONSTRAINT player_cards_sport_slug_check
  CHECK (sport_slug IN ('football', 'cricket', 'basketball', 'badminton'));

DROP POLICY IF EXISTS "Public football cards readable" ON public.player_cards;
CREATE POLICY "Public sport cards readable"
  ON public.player_cards FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Users upsert own cards" ON public.player_cards;
CREATE POLICY "Users upsert own cards"
  ON public.player_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own cards" ON public.player_cards;
CREATE POLICY "Users update own cards"
  ON public.player_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Multi-sport verified stats + flexible payload
ALTER TABLE public.player_verified_stats DROP CONSTRAINT IF EXISTS player_verified_stats_sport_slug_check;
ALTER TABLE public.player_verified_stats
  ADD COLUMN IF NOT EXISTS stats_payload jsonb NOT NULL DEFAULT '{}';

ALTER TABLE public.player_verified_stats
  ADD CONSTRAINT player_verified_stats_sport_slug_check
  CHECK (sport_slug IN ('football', 'cricket', 'basketball', 'badminton'));

DROP POLICY IF EXISTS "Verified stats public read" ON public.player_verified_stats;
CREATE POLICY "Verified stats public read"
  ON public.player_verified_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- Backfill stats_payload from legacy columns
UPDATE public.player_verified_stats
SET stats_payload = jsonb_build_object(
  'goals', goals,
  'assists', assists,
  'matches', matches
)
WHERE stats_payload = '{}'::jsonb OR stats_payload IS NULL;

-- Match history scorelines (turf-verified)
CREATE TABLE IF NOT EXISTS public.player_match_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_slug text NOT NULL CHECK (sport_slug IN ('football', 'cricket', 'basketball', 'badminton')),
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  verified_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_date date NOT NULL DEFAULT CURRENT_DATE,
  team_name text NOT NULL,
  team_icon text,
  player_score integer NOT NULL DEFAULT 0 CHECK (player_score >= 0),
  opponent_name text NOT NULL,
  opponent_icon text,
  opponent_score integer NOT NULL DEFAULT 0 CHECK (opponent_score >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS player_match_history_player_sport_idx
  ON public.player_match_history (player_user_id, sport_slug, match_date DESC);

ALTER TABLE public.player_match_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match history public read"
  ON public.player_match_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage match history"
  ON public.player_match_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
