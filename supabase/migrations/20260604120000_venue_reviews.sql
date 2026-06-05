-- Google-style venue reviews: one review per user per turf, aggregated rating on venues.

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;

CREATE TABLE public.venue_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL CHECK (char_length(trim(comment)) >= 10 AND char_length(comment) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, user_id)
);

CREATE INDEX venue_reviews_venue_id_created_at_idx
  ON public.venue_reviews (venue_id, created_at DESC);

ALTER TABLE public.venue_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews public read"
  ON public.venue_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users insert own reviews"
  ON public.venue_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON public.venue_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reviews"
  ON public.venue_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage reviews"
  ON public.venue_reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.refresh_venue_rating_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_venue uuid;
  avg_rating numeric;
  total_count integer;
BEGIN
  target_venue := COALESCE(NEW.venue_id, OLD.venue_id);

  SELECT ROUND(AVG(r.rating)::numeric, 1), COUNT(*)::integer
  INTO avg_rating, total_count
  FROM public.venue_reviews r
  WHERE r.venue_id = target_venue;

  UPDATE public.venues v
  SET
    rating = CASE WHEN total_count > 0 THEN avg_rating ELSE NULL END,
    review_count = COALESCE(total_count, 0)
  WHERE v.id = target_venue;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER venue_reviews_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.venue_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_venue_rating_stats();
