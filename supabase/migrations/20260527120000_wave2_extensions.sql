-- Wave 2 extensions: account notifications, settings, owners, profile ban
-- Idempotent version (safe to rerun)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'app_role'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'app_role' AND e.enumlabel = 'owner'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'owner';
  END IF;
END $$;

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

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';

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

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE IF NOT EXISTS public.admin_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  target_type text NOT NULL DEFAULT 'all',
  channel text NOT NULL DEFAULT 'in-app',
  delivery_count integer NOT NULL DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notification_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_notification_log' AND policyname = 'Admins view notification log'
  ) THEN
    CREATE POLICY "Admins view notification log" ON public.admin_notification_log
      FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_notification_log' AND policyname = 'Admins insert notification log'
  ) THEN
    CREATE POLICY "Admins insert notification log" ON public.admin_notification_log
      FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'Good Bookies'),
  ('contact_email', 'hello@goodbookies.com'),
  ('support_phone', '+91 98765 43210'),
  ('peak_hour_surcharge_percent', '15'),
  ('cancellation_hours', '24'),
  ('platform_commission_rate', '10')
ON CONFLICT (key) DO NOTHING;
