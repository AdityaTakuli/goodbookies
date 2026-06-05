import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  AVATAR_INVENTORY,
  getClubById,
  getClubsForSport,
  getFlagById,
  INVENTORY_CLUBS,
  INVENTORY_FLAGS,
} from "@/lib/inventory/catalog";
import type { MatchHistoryRow, PlayerCardView } from "@/lib/player-card.types";
import {
  getSportConfig,
  isPlayerSportSlug,
  PLAYER_SPORT_SLUGS,
  type PlayerSportSlug,
  SPORT_CONFIGS,
  VERIFIED_STAT_KEYS,
} from "@/lib/sports/player-sports";

let playerCardsReady: boolean | null = null;

async function playerCardsEnabled() {
  if (playerCardsReady != null) return playerCardsReady;
  const { error } = await supabaseAdmin.from("player_cards").select("id").limit(1);
  playerCardsReady = !error?.message?.includes("player_cards");
  return playerCardsReady;
}

const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{3,}$/);

const sportSchema = z.enum(PLAYER_SPORT_SLUGS);

const settingsSchema = z.object({
  username: usernameSchema.optional(),
  bio: z.string().max(280).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  avatar_inventory_id: z.string().max(64).optional().nullable(),
  full_name: z.string().min(1).max(80).optional(),
  avatar_url: z.string().max(3_000_000).optional().nullable(),
  club_id: z.string().max(64).optional().nullable(),
  flag_id: z.string().min(1).max(64),
  position: z.string().min(1).max(32),
  jersey_number: z.number().int().min(1).max(99).optional().nullable(),
  preferred_foot: z.enum(["left", "right", "both"]).optional().nullable(),
  card_ratings: z.record(z.string(), z.number().int().min(1).max(99)).optional(),
  sport_settings: z.record(z.string(), z.unknown()).optional(),
  is_public: z.boolean().default(true),
});

function aggregateVerifiedStats(sport: PlayerSportSlug, rows: { stats_payload?: Record<string, unknown>; goals?: number; assists?: number; matches?: number }[]) {
  const keys = VERIFIED_STAT_KEYS[sport];
  const totals: Record<string, number> = {};
  for (const key of keys) totals[key] = 0;

  for (const row of rows) {
    const payload = (row.stats_payload ?? {}) as Record<string, unknown>;
    if (Object.keys(payload).length === 0) {
      if (sport === "football") {
        totals.goals = (totals.goals ?? 0) + Number(row.goals ?? 0);
        totals.assists = (totals.assists ?? 0) + Number(row.assists ?? 0);
        totals.matches = (totals.matches ?? 0) + Number(row.matches ?? 0);
      }
      continue;
    }
    for (const key of keys) {
      totals[key] = (totals[key] ?? 0) + Number(payload[key] ?? 0);
    }
  }

  if ((totals.matches ?? 0) > 0 && keys.includes("win_pct")) {
    const wins = Number(totals.matches_won ?? 0);
    totals.win_pct = Math.round((wins / totals.matches!) * 100);
  }
  return totals;
}

function enrichCard(
  sport: PlayerSportSlug,
  card: Record<string, unknown> | null,
  profile: Record<string, unknown> | null,
  verifiedStats: Record<string, number>,
): PlayerCardView | null {
  if (!profile) return null;
  const config = getSportConfig(sport);
  const ratings = { ...config.defaultRatings, ...((card?.card_ratings as Record<string, number>) ?? {}) };
  const clubId = card?.club_id as string | null | undefined;

  return {
    sportSlug: sport,
    club: config.showClub ? getClubById(clubId, sport) : null,
    flag: getFlagById((card?.flag_id as string) ?? "in"),
    position: (card?.position as string) ?? config.positions[0],
    jerseyNumber: (card?.jersey_number as number) ?? null,
    preferredFoot: (card?.preferred_foot as string) ?? null,
    sportSettings: (card?.sport_settings as Record<string, unknown>) ?? {},
    cardRatings: ratings,
    isPublic: card ? Boolean(card.is_public) : true,
    verifiedStats,
    player: {
      id: profile.id as string,
      username: (profile.username as string) ?? "",
      fullName: (profile.full_name as string) || (profile.email as string)?.split("@")[0] || "Player",
      bio: (profile.bio as string) ?? null,
      city: (profile.city as string) ?? null,
      avatarUrl: (profile.avatar_url as string) ?? null,
      avatarInventoryId: (profile.avatar_inventory_id as string) ?? null,
    },
  };
}

async function loadProfileByUsername(username: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id, is_banned")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.is_banned) return null;
  return data;
}

async function loadSportCard(userId: string, sport: PlayerSportSlug, publicOnly = false) {
  let q = supabaseAdmin.from("player_cards").select("*").eq("user_id", userId).eq("sport_slug", sport);
  if (publicOnly) q = q.eq("is_public", true);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function loadVerified(userId: string, sport: PlayerSportSlug) {
  const { data, error } = await supabaseAdmin
    .from("player_verified_stats")
    .select("stats_payload, goals, assists, matches")
    .eq("player_user_id", userId)
    .eq("sport_slug", sport);
  if (error && !error.message.includes("player_verified_stats")) throw new Error(error.message);
  return aggregateVerifiedStats(sport, data ?? []);
}

async function loadGoalsByTurf(userId: string): Promise<{ venueName: string; goals: number }[]> {
  const { data, error } = await supabaseAdmin
    .from("player_verified_stats")
    .select("goals, stats_payload, venue:venues(name)")
    .eq("player_user_id", userId)
    .eq("sport_slug", "football");
  if (error && !error.message.includes("player_verified_stats")) return [];

  const byVenue = new Map<string, number>();
  for (const row of data ?? []) {
    const venue = row.venue as { name?: string } | null;
    const name = venue?.name ?? "Unknown turf";
    const payload = (row.stats_payload ?? {}) as Record<string, unknown>;
    const g = Number(payload.goals ?? row.goals ?? 0);
    byVenue.set(name, (byVenue.get(name) ?? 0) + g);
  }
  return [...byVenue.entries()]
    .map(([venueName, goals]) => ({ venueName, goals }))
    .filter((x) => x.goals > 0)
    .sort((a, b) => b.goals - a.goals);
}

export const listInventoryFlags = createServerFn({ method: "GET" }).handler(async () => ({ flags: INVENTORY_FLAGS }));

export const listInventoryClubs = createServerFn({ method: "GET" })
  .inputValidator((input: { sport?: string } | undefined) =>
    z.object({ sport: sportSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => ({
    clubs: data.sport ? getClubsForSport(data.sport) : INVENTORY_CLUBS,
  }));

export const listAvatarInventory = createServerFn({ method: "GET" }).handler(async () => ({
  avatars: AVATAR_INVENTORY,
}));

export const getMyPlayerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const enabled = await playerCardsEnabled();
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const cards: Partial<Record<PlayerSportSlug, PlayerCardView>> = {};
    if (enabled) {
      for (const sport of PLAYER_SPORT_SLUGS) {
        const row = await loadSportCard(context.userId, sport);
        const verified = await loadVerified(context.userId, sport);
        const view = enrichCard(sport, row, profile, verified);
        if (view) cards[sport] = view;
      }
    }

    const { data: matches } = await supabaseAdmin
      .from("player_match_history")
      .select("*")
      .eq("player_user_id", context.userId)
      .order("match_date", { ascending: false })
      .limit(20);

    const goalsByTurf = enabled ? await loadGoalsByTurf(context.userId) : [];

    return {
      profile,
      cards,
      sports: PLAYER_SPORT_SLUGS.map((slug) => SPORT_CONFIGS[slug]),
      matches: mapMatches(matches ?? []),
      goalsByTurf,
      publicUrl: profile?.username ? `/players/${profile.username}` : null,
      migrationRequired: !enabled,
    };
  });

export const getPlayerProfileBySport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sport: string }) => z.object({ sport: sportSchema }).parse(input))
  .handler(async ({ context, data }) => {
    if (!(await playerCardsEnabled())) throw new Error("Player cards migration required");
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id")
      .eq("id", context.userId)
      .maybeSingle();
    const row = await loadSportCard(context.userId, data.sport);
    const verified = await loadVerified(context.userId, data.sport);
    return enrichCard(data.sport, row, profile, verified);
  });

export const updatePlayerProfileSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sport: string } & Record<string, unknown>) =>
    z.object({ sport: sportSchema }).and(settingsSchema).parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!(await playerCardsEnabled())) throw new Error("Player cards migration required");
    const sport = data.sport;
    const config = getSportConfig(sport);

    if (data.username) {
      const { data: taken } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", data.username.toLowerCase())
        .neq("id", context.userId)
        .maybeSingle();
      if (taken) throw new Error("Username is already taken");
    }

    const profilePatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.username != null) profilePatch.username = data.username.toLowerCase();
    if (data.full_name != null) profilePatch.full_name = data.full_name.trim();
    if (data.bio !== undefined) profilePatch.bio = data.bio;
    if (data.city !== undefined) profilePatch.city = data.city;
    if (data.avatar_inventory_id !== undefined) profilePatch.avatar_inventory_id = data.avatar_inventory_id;
    if (data.avatar_url !== undefined) profilePatch.avatar_url = data.avatar_url;

    const { error: profileErr } = await context.supabase.from("profiles").update(profilePatch).eq("id", context.userId);
    if (profileErr) throw new Error(profileErr.message);

    const ratings = { ...config.defaultRatings, ...(data.card_ratings ?? {}) };
    const cardPayload = {
      user_id: context.userId,
      sport_slug: sport,
      club_id: config.showClub ? (data.club_id ?? getClubsForSport(sport).at(-1)?.id) : null,
      flag_id: data.flag_id,
      position: data.position,
      jersey_number: data.jersey_number ?? null,
      preferred_foot: sport === "football" ? (data.preferred_foot ?? null) : null,
      card_ratings: ratings,
      sport_settings: data.sport_settings ?? {},
      is_public: data.is_public,
      updated_at: new Date().toISOString(),
    };

    const { data: row, error: cardErr } = await context.supabase
      .from("player_cards")
      .upsert(cardPayload, { onConflict: "user_id,sport_slug" })
      .select("*")
      .single();
    if (cardErr) throw new Error(cardErr.message);

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id")
      .eq("id", context.userId)
      .maybeSingle();

    const verified = await loadVerified(context.userId, sport);
    return {
      card: enrichCard(sport, row, profile, verified),
      publicUrl: profile?.username ? `/players/${profile.username}?sport=${sport}` : null,
    };
  });

export const getPublicPlayerProfile = createServerFn({ method: "GET" })
  .inputValidator((input: { username: string; sport?: string }) =>
    z.object({ username: z.string().min(3).max(30), sport: sportSchema.optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!(await playerCardsEnabled())) return null;
    const profile = await loadProfileByUsername(data.username);
    if (!profile) return null;

    const activeSport = data.sport && isPlayerSportSlug(data.sport) ? data.sport : "football";
    const cards: Partial<Record<PlayerSportSlug, PlayerCardView>> = {};

    for (const sport of PLAYER_SPORT_SLUGS) {
      const row = await loadSportCard(profile.id, sport, true);
      if (!row) continue;
      const verified = await loadVerified(profile.id, sport);
      const view = enrichCard(sport, row, profile, verified);
      if (view) cards[sport] = view;
    }

    if (Object.keys(cards).length === 0) return null;

    const { data: matches } = await supabaseAdmin
      .from("player_match_history")
      .select("*")
      .eq("player_user_id", profile.id)
      .order("match_date", { ascending: false })
      .limit(12);

    return {
      activeSport: cards[activeSport] ? activeSport : (Object.keys(cards)[0] as PlayerSportSlug),
      cards,
      matches: mapMatches(matches ?? []),
      publicUrl: `/players/${profile.username}`,
    };
  });

export const listPlayerMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sport?: string } | undefined) =>
    z.object({ sport: sportSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    let q = supabaseAdmin
      .from("player_match_history")
      .select("*")
      .eq("player_user_id", context.userId)
      .order("match_date", { ascending: false })
      .limit(30);
    if (data.sport) q = q.eq("sport_slug", data.sport);
    const { data: rows, error } = await q;
    if (error && !error.message.includes("player_match_history")) throw new Error(error.message);
    return mapMatches(rows ?? []);
  });

function mapMatches(rows: Record<string, unknown>[]): MatchHistoryRow[] {
  return rows.map((r) => ({
    id: r.id as string,
    sportSlug: r.sport_slug as PlayerSportSlug,
    matchDate: r.match_date as string,
    teamName: r.team_name as string,
    teamIcon: (r.team_icon as string) ?? null,
    playerScore: Number(r.player_score ?? 0),
    opponentName: r.opponent_name as string,
    opponentIcon: (r.opponent_icon as string) ?? null,
    opponentScore: Number(r.opponent_score ?? 0),
  }));
}

/** Legacy aliases */
export const getMyFootballCard = getMyPlayerDashboard;
export const upsertMyFootballCard = updatePlayerProfileSettings;
