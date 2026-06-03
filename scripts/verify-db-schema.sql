-- Good Bookies — paste results in chat for schema verification (read-only)

-- 1) Required columns for group booking + open lobbies
select
  case
    when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'venues' and column_name = 'max_players_allowed'
    ) then 'OK'
    else 'MISSING'
  end as venues_max_players_allowed,
  case
    when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'bookings' and column_name = 'player_count'
    ) then 'OK'
    else 'MISSING'
  end as bookings_player_count,
  case
    when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'bookings' and column_name = 'player_names'
    ) then 'OK'
    else 'MISSING'
  end as bookings_player_names,
  case
    when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'bookings' and column_name = 'is_open_lobby'
    ) then 'OK'
    else 'MISSING'
  end as bookings_is_open_lobby,
  case
    when exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'lobby_queries'
    ) then 'OK'
    else 'MISSING'
  end as lobby_queries_table,
  case
    when exists (
      select 1 from pg_indexes
      where schemaname = 'public' and indexname = 'bookings_no_double_book'
    ) then 'BAD (drop it)'
    else 'OK (absent)'
  end as bookings_no_double_book_index;

-- 2) All public tables
select table_name
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE'
order by table_name;

-- 3) bookings + lobby_queries columns
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('bookings', 'venues', 'lobby_queries', 'payments')
order by table_name, ordinal_position;

-- 4) Indexes on bookings
select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'bookings'
order by indexname;

-- 5) lobby_queries policies (if table exists)
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'lobby_queries'
order by policyname;

-- 6) Public functions
select p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;
