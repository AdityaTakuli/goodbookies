-- Player self-scored matches (cricket + football). Separate from turf-verified player_match_history.

CREATE TABLE IF NOT EXISTS public.scoring_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_slug text NOT NULL CHECK (sport_slug IN ('football', 'cricket')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'live', 'completed')),
  team_a_name text NOT NULL DEFAULT 'Team A',
  team_b_name text NOT NULL DEFAULT 'Team B',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_date date NOT NULL DEFAULT CURRENT_DATE,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scoring_match_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.scoring_matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team text NOT NULL CHECK (team IN ('a', 'b')),
  display_name text NOT NULL,
  username text,
  jersey_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.scoring_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.scoring_matches(id) ON DELETE CASCADE,
  sport_slug text NOT NULL CHECK (sport_slug IN ('football', 'cricket')),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  seq integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scoring_events_match_seq_idx
  ON public.scoring_events (match_id, seq);

CREATE TABLE IF NOT EXISTS public.scoring_player_stats (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_slug text NOT NULL CHECK (sport_slug IN ('football', 'cricket', 'basketball', 'badminton')),
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sport_slug)
);

ALTER TABLE public.scoring_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_player_stats ENABLE ROW LEVEL SECURITY;

-- Match creators + participants can read; creator manages setup/live
CREATE POLICY "Scoring matches read participants"
  ON public.scoring_matches FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.scoring_match_players p
      WHERE p.match_id = scoring_matches.id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Scoring matches insert own"
  ON public.scoring_matches FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Scoring matches update creator"
  ON public.scoring_matches FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Scoring match players read"
  ON public.scoring_match_players FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scoring_matches m
      WHERE m.id = scoring_match_players.match_id
        AND (m.created_by = auth.uid() OR scoring_match_players.user_id = auth.uid())
    )
  );

CREATE POLICY "Scoring match players manage creator"
  ON public.scoring_match_players FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scoring_matches m
      WHERE m.id = scoring_match_players.match_id AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Scoring events read participants"
  ON public.scoring_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scoring_match_players p
      WHERE p.match_id = scoring_events.match_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.scoring_matches m
      WHERE m.id = scoring_events.match_id AND m.created_by = auth.uid()
    )
  );

CREATE POLICY "Scoring events insert scorer"
  ON public.scoring_events FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.scoring_matches m
      WHERE m.id = scoring_events.match_id
        AND m.created_by = auth.uid()
        AND m.status = 'live'
    )
  );

CREATE POLICY "Scoring player stats public read"
  ON public.scoring_player_stats FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Scoring player stats upsert system"
  ON public.scoring_player_stats FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
