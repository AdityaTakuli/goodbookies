alter table public.bookings
add column if not exists is_open_lobby boolean not null default false;

create table if not exists public.lobby_queries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  seeker_id uuid not null references auth.users(id) on delete cascade,
  player_count integer not null check (player_count > 0),
  player_names text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lobby_queries_booking_id_idx on public.lobby_queries(booking_id);
create index if not exists lobby_queries_seeker_id_idx on public.lobby_queries(seeker_id);
create index if not exists lobby_queries_status_idx on public.lobby_queries(status);

alter table public.lobby_queries enable row level security;

create policy "Users read own lobby queries"
  on public.lobby_queries for select to authenticated
  using (auth.uid() = seeker_id);

create policy "Hosts read queries on their bookings"
  on public.lobby_queries for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.user_id = auth.uid()
    )
  );

create policy "Authenticated users insert lobby queries"
  on public.lobby_queries for insert to authenticated
  with check (auth.uid() = seeker_id);

create policy "Hosts update queries on their bookings"
  on public.lobby_queries for update to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.user_id = auth.uid()
    )
  );
