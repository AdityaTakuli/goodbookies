-- Allow multiple bookings on the same hour until player capacity is full.
-- The old index blocked any second booking at the same start_hour.
drop index if exists public.bookings_no_double_book;

-- Ensure capacity columns exist (safe if already applied).
alter table public.venues
add column if not exists max_players_allowed integer not null default 10;

alter table public.bookings
add column if not exists player_count integer not null default 1;

alter table public.bookings
add column if not exists player_names text[] not null default '{}';

update public.venues
set max_players_allowed = 10
where max_players_allowed is null or max_players_allowed < 1;

update public.bookings
set player_count = 1
where player_count is null or player_count < 1;
