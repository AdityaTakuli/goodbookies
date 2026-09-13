-- Do not claim phone on auth.users insert (blocks re-signup if email confirm fails).
-- Phone is written after confirmation via claimMyPhone server function.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acct_type text := COALESCE(new.raw_user_meta_data->>'account_type', 'player');
BEGIN
  IF acct_type NOT IN ('player', 'partner', 'both') THEN
    acct_type := 'player';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, account_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    NULL,
    acct_type
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    account_type = COALESCE(EXCLUDED.account_type, profiles.account_type);

  -- All accounts are players (can book turfs)
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF acct_type IN ('partner', 'both') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
