-- ⚠️ DESTRUCTIVE: Deletes ALL login accounts (players + partners + admins).
-- Run in Supabase SQL Editor only if you want a clean slate.
-- Keeps: venues metadata may be removed if tied to owners (CASCADE), sports catalog, etc.

-- 1) Preview what will be removed
SELECT 'auth.users' AS table_name, COUNT(*) AS rows FROM auth.users
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'owners', COUNT(*) FROM public.owners
UNION ALL
SELECT 'bookings', COUNT(*) FROM public.bookings
UNION ALL
SELECT 'player_cards', COUNT(*) FROM public.player_cards;

-- 2) Delete every account (cascades profiles, owners, bookings, cards, reviews, etc.)
DELETE FROM auth.users;

-- 3) Confirm empty
SELECT 'auth.users' AS table_name, COUNT(*) AS rows FROM auth.users
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'owners', COUNT(*) FROM public.owners;
