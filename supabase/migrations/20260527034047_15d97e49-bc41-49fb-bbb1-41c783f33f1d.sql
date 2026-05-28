-- Environment-safe admin promotion.
-- Replace admin email below (or run a one-off SQL manually) after the user signs up.
DO $$
DECLARE
  target_email text := 'admin@example.com';
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, 'admin'::public.app_role
  FROM auth.users u
  WHERE lower(u.email) = lower(target_email)
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;