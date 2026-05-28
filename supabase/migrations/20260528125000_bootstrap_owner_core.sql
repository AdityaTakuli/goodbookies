-- Bootstrap missing core tables for owner/account modules.
-- Safe to run on partially-migrated databases.

-- 1) Ensure app_role enum includes 'owner'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'app_role'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'app_role' AND e.enumlabel = 'owner'
    ) THEN
      ALTER TYPE public.app_role ADD VALUE 'owner';
    END IF;
  END IF;
END $$;

-- 2) Ensure owner_status enum exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'owner_status'
  ) THEN
    CREATE TYPE public.owner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
  END IF;
END $$;

-- 3) owners table
CREATE TABLE IF NOT EXISTS public.owners (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  city text NOT NULL,
  status public.owner_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  platform_commission_override numeric(5, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- 4) notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'booking',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5) site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 6) owners policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'owners' AND policyname = 'Owners read own row'
  ) THEN
    CREATE POLICY "Owners read own row" ON public.owners
      FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'owners' AND policyname = 'Admins manage owners'
  ) THEN
    CREATE POLICY "Admins manage owners" ON public.owners
      FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 7) notifications policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users read own notifications'
  ) THEN
    CREATE POLICY "Users read own notifications" ON public.notifications
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Users update own notifications'
  ) THEN
    CREATE POLICY "Users update own notifications" ON public.notifications
      FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Admins manage notifications'
  ) THEN
    CREATE POLICY "Admins manage notifications" ON public.notifications
      FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 8) site_settings policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Admins manage settings'
  ) THEN
    CREATE POLICY "Admins manage settings" ON public.site_settings
      FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Public read settings'
  ) THEN
    CREATE POLICY "Public read settings" ON public.site_settings
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- 9) seed default settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('site_name', 'Good Bookies'),
  ('contact_email', 'hello@goodbookies.com'),
  ('support_phone', '+91 98765 43210'),
  ('peak_hour_surcharge_percent', '15'),
  ('cancellation_hours', '24'),
  ('platform_commission_rate', '10')
ON CONFLICT (key) DO NOTHING;
