-- Wave 2 extensions: account notifications, settings, owners, profile ban

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

ALTER TYPE public.app_role ADD VALUE 'owner';

CREATE TYPE public.owner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

CREATE TABLE public.owners (
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

CREATE POLICY "Owners read own row" ON public.owners
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins manage owners" ON public.owners
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved';

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'booking',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.admin_notification_log (
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
CREATE POLICY "Admins view notification log" ON public.admin_notification_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert notification log" ON public.admin_notification_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'Good Bookies'),
  ('contact_email', 'hello@goodbookies.com'),
  ('support_phone', '+91 98765 43210'),
  ('peak_hour_surcharge_percent', '15'),
  ('cancellation_hours', '24'),
  ('platform_commission_rate', '10')
ON CONFLICT (key) DO NOTHING;
