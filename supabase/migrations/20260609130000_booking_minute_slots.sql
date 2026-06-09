ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_minute integer,
  ADD COLUMN IF NOT EXISTS end_minute integer;

UPDATE public.bookings
SET
  start_minute = start_hour * 60,
  end_minute = end_hour * 60
WHERE start_minute IS NULL;
