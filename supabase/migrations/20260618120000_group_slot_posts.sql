alter table public.bookings
add column if not exists share_to_group boolean not null default true;

create table if not exists public.group_slot_posts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  booking_date date not null,
  start_minute integer not null,
  end_minute integer not null,
  message text not null,
  booked_players integer not null,
  total_capacity integer not null,
  remaining_players integer not null,
  updated_at timestamptz not null default now(),
  unique (venue_id, booking_date, start_minute, end_minute)
);

create index if not exists group_slot_posts_venue_date_idx
  on public.group_slot_posts (venue_id, booking_date);
