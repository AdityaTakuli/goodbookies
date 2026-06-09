ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS map_url text,
  ADD COLUMN IF NOT EXISTS area_sq_ft integer,
  ADD COLUMN IF NOT EXISTS water_available text;

ALTER TABLE public.venues
  DROP CONSTRAINT IF EXISTS venues_area_sq_ft_check;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_area_sq_ft_check CHECK (area_sq_ft IS NULL OR area_sq_ft > 0);
