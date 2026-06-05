-- Separate player (books turfs) vs partner (turf owner) accounts.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'player'
  CHECK (account_type IN ('player', 'partner'));

-- Existing turf owners → partner accounts
UPDATE public.profiles p
SET account_type = 'partner'
WHERE EXISTS (SELECT 1 FROM public.owners o WHERE o.id = p.id);

-- Partners should not carry the generic "user" player role
DELETE FROM public.user_roles ur
WHERE ur.role = 'user'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = ur.user_id AND p.account_type = 'partner'
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acct_type text := COALESCE(new.raw_user_meta_data->>'account_type', 'player');
BEGIN
  IF acct_type NOT IN ('player', 'partner') THEN
    acct_type := 'player';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, account_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    acct_type
  );

  IF acct_type = 'player' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');
  END IF;

  RETURN new;
END;
$$;
