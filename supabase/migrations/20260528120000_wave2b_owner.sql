-- Wave 2b: Owner venues, pricing, slots, payouts, payments

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS venue_type text DEFAULT 'outdoor',
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pin_code text,
  ADD COLUMN IF NOT EXISTS lat numeric(10, 7),
  ADD COLUMN IF NOT EXISTS lng numeric(10, 7),
  ADD COLUMN IF NOT EXISTS operating_days integer[] DEFAULT ARRAY[1,2,3,4,5,6,0],
  ADD COLUMN IF NOT EXISTS holiday_dates date[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS buffer_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_concurrent integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS advance_booking_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS confirmation_mode text NOT NULL DEFAULT 'instant',
  ADD COLUMN IF NOT EXISTS cancellation_policy text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE TABLE IF NOT EXISTS public.venue_peak_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer,
  start_time time NOT NULL,
  end_time time NOT NULL,
  surcharge_type text NOT NULL DEFAULT 'percent',
  surcharge_value numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.venue_day_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL,
  price_override integer NOT NULL,
  UNIQUE (venue_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.venue_date_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  price_override integer NOT NULL,
  UNIQUE (venue_id, date)
);

CREATE TABLE IF NOT EXISTS public.venue_duration_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  min_hours integer NOT NULL,
  discount_percent numeric(5, 2) NOT NULL DEFAULT 0,
  UNIQUE (venue_id, min_hours)
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric(10, 2) NOT NULL,
  min_booking_amount integer NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expiry_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, code)
);

CREATE TABLE IF NOT EXISTS public.slot_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  block_date date,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_day integer,
  created_by_owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.owner_payout_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL UNIQUE,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  ifsc_code text NOT NULL,
  bank_name text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  commission_deducted integer NOT NULL DEFAULT 0,
  net_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payout_date timestamptz,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  method text NOT NULL DEFAULT 'razorpay',
  razorpay_order_id text,
  razorpay_payment_id text,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id);

-- Owner can read bookings for their venues (via server); add policy for owner select
CREATE POLICY "Owners view venue bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = bookings.venue_id AND v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage own venues" ON public.venues
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
