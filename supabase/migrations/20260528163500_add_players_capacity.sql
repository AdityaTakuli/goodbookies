alter table public.venues
add column if not exists max_players_allowed integer not null default 10;

alter table public.venues
drop constraint if exists venues_max_players_allowed_check;

alter table public.venues
add constraint venues_max_players_allowed_check check (max_players_allowed >= 1);

alter table public.bookings
add column if not exists player_count integer not null default 1;

alter table public.bookings
drop constraint if exists bookings_player_count_check;

alter table public.bookings
add constraint bookings_player_count_check check (player_count >= 1);
