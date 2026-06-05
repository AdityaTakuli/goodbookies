-- One login can be both player (books turfs) and partner (owns turfs).
-- Same email allowed; partners keep player access but cannot book their own venues.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_account_type_check
  CHECK (account_type IN ('player', 'partner', 'both'));

UPDATE public.profiles p
SET account_type = 'both'
WHERE EXISTS (SELECT 1 FROM public.owners o WHERE o.id = p.id);

-- Every partner also needs the player "user" role to book turfs
INSERT INTO public.user_roles (user_id, role)
SELECT o.id, 'user'::public.app_role
FROM public.owners o
ON CONFLICT (user_id, role) DO NOTHING;

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
    new.raw_user_meta_data->>'phone',
    acct_type
  );

  -- All accounts are players (can book turfs)
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;
