alter table public.bookings
add column if not exists player_names text[] not null default '{}';
