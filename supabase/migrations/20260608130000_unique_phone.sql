-- One account per phone number (normalized Indian mobile).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_normalized text;

CREATE OR REPLACE FUNCTION public.normalize_phone_digits(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p IS NULL OR btrim(p) = '' THEN NULL
    WHEN length(regexp_replace(p, '[^0-9]', '', 'g')) = 10
      AND regexp_replace(p, '[^0-9]', '', 'g') ~ '^[6-9]' THEN
      '+91' || regexp_replace(p, '[^0-9]', '', 'g')
    WHEN length(regexp_replace(p, '[^0-9]', '', 'g')) = 12
      AND regexp_replace(p, '[^0-9]', '', 'g') LIKE '91%' THEN
      '+' || regexp_replace(p, '[^0-9]', '', 'g')
    ELSE NULL
  END;
$$;

UPDATE public.profiles
SET phone_normalized = public.normalize_phone_digits(phone)
WHERE phone IS NOT NULL AND phone_normalized IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_normalized_key
  ON public.profiles (phone_normalized)
  WHERE phone_normalized IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_profile_phone_normalized()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.phone_normalized := public.normalize_phone_digits(NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_phone_normalized ON public.profiles;
CREATE TRIGGER profiles_phone_normalized
  BEFORE INSERT OR UPDATE OF phone ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_phone_normalized();
