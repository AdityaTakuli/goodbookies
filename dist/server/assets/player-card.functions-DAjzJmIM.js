import { c as createServerRpc } from "./createServerRpc-CenyVy9S.js";
import { l as createServerFn } from "./server-BtUn1Hgv.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CO-X9AGf.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { a as INVENTORY_FLAGS, I as INVENTORY_CLUBS, c as getClubsForSport, A as AVATAR_INVENTORY, d as getFlagById, b as getClubById } from "./catalog-yFqo9-Pm.js";
import { b as listScoringHistoryForUser } from "./scoring.functions-DT7s7Myo.js";
import { p as parseSkillLevel } from "./player-card.utils-kMUYNEuj.js";
import { P as PLAYER_SPORT_SLUGS, S as SPORT_CONFIGS, i as isPlayerSportSlug, g as getSportConfig, V as VERIFIED_STAT_KEYS } from "./player-sports-D0yo17RI.js";
import { s as stringType, e as enumType, o as objectType, c as booleanType, r as recordType, u as unknownType, n as numberType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "./urls-CDalmZy3.js";
let playerCardsReady = null;
async function playerCardsEnabled() {
  if (playerCardsReady != null) return playerCardsReady;
  const {
    error
  } = await supabaseAdmin.from("player_cards").select("id").limit(1);
  playerCardsReady = !error?.message?.includes("player_cards");
  return playerCardsReady;
}
const usernameSchema = stringType().min(3).max(30).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{3,}$/);
const sportSchema = enumType(PLAYER_SPORT_SLUGS);
const settingsSchema = objectType({
  username: usernameSchema.optional(),
  bio: stringType().max(280).optional().nullable(),
  city: stringType().max(80).optional().nullable(),
  avatar_inventory_id: stringType().max(64).optional().nullable(),
  full_name: stringType().min(1).max(80).optional(),
  avatar_url: stringType().max(500).optional().nullable().refine((v) => !v || !v.startsWith("data:"), {
    message: "Upload photos via file upload, not embedded data"
  }),
  club_id: stringType().max(64).optional().nullable(),
  flag_id: stringType().min(1).max(64),
  position: stringType().min(1).max(32),
  jersey_number: numberType().int().min(1).max(99).optional().nullable(),
  preferred_foot: enumType(["left", "right", "both"]).optional().nullable(),
  card_ratings: recordType(stringType(), numberType().int().min(1).max(99)).optional(),
  sport_settings: recordType(stringType(), unknownType()).optional(),
  is_public: booleanType().default(true)
});
function aggregateVerifiedStats(sport, rows) {
  const keys = VERIFIED_STAT_KEYS[sport];
  const totals = {};
  for (const key of keys) totals[key] = 0;
  for (const row of rows) {
    const payload = row.stats_payload ?? {};
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
    totals.win_pct = Math.round(wins / totals.matches * 100);
  }
  return totals;
}
function enrichCard(sport, card, profile, verifiedStats) {
  if (!profile) return null;
  const config = getSportConfig(sport);
  const ratings = {
    ...config.defaultRatings,
    ...card?.card_ratings ?? {}
  };
  const clubId = card?.club_id;
  return {
    sportSlug: sport,
    club: config.showClub ? getClubById(clubId, sport) : null,
    flag: getFlagById(card?.flag_id ?? "in"),
    position: card?.position ?? config.positions[0],
    jerseyNumber: card?.jersey_number ?? null,
    preferredFoot: card?.preferred_foot ?? null,
    sportSettings: card?.sport_settings ?? {},
    cardRatings: ratings,
    isPublic: card ? Boolean(card.is_public) : true,
    verifiedStats,
    player: {
      id: profile.id,
      username: profile.username ?? "",
      fullName: profile.full_name || profile.email?.split("@")[0] || "Player",
      bio: profile.bio ?? null,
      city: profile.city ?? null,
      avatarUrl: profile.avatar_url ?? null,
      avatarInventoryId: profile.avatar_inventory_id ?? null
    }
  };
}
async function loadProfileByUsername(username) {
  const {
    data,
    error
  } = await supabaseAdmin.from("profiles").select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id, is_banned").eq("username", username.toLowerCase()).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.is_banned) return null;
  return data;
}
async function loadSportCard(userId, sport, publicOnly = false) {
  let q = supabaseAdmin.from("player_cards").select("*").eq("user_id", userId).eq("sport_slug", sport);
  if (publicOnly) q = q.eq("is_public", true);
  const {
    data,
    error
  } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
async function loadVerified(userId, sport) {
  const {
    data,
    error
  } = await supabaseAdmin.from("player_verified_stats").select("stats_payload, goals, assists, matches").eq("player_user_id", userId).eq("sport_slug", sport);
  if (error && !error.message.includes("player_verified_stats")) throw new Error(error.message);
  return aggregateVerifiedStats(sport, data ?? []);
}
async function loadScoringStats(userId, sport) {
  const {
    data
  } = await supabaseAdmin.from("scoring_player_stats").select("stats").eq("user_id", userId).eq("sport_slug", sport).maybeSingle();
  return data?.stats ?? {};
}
function mergeScoringIntoVerified(sport, verified, scoring) {
  if (sport !== "cricket" && sport !== "football") return verified;
  const merged = {
    ...verified
  };
  for (const [k, v] of Object.entries(scoring)) {
    merged[k] = (merged[k] ?? 0) + v;
  }
  return merged;
}
async function loadMatchHistory(userId) {
  const {
    data: verifiedRows
  } = await supabaseAdmin.from("player_match_history").select("*").eq("player_user_id", userId).order("match_date", {
    ascending: false
  }).limit(20);
  const verified = mapMatches(verifiedRows ?? []).map((m) => ({
    ...m,
    source: "verified"
  }));
  let scoring = [];
  try {
    scoring = (await listScoringHistoryForUser(userId)).map((m) => ({
      ...m,
      source: "scoring"
    }));
  } catch {
    scoring = [];
  }
  return [...verified, ...scoring].sort((a, b) => b.matchDate.localeCompare(a.matchDate)).slice(0, 30);
}
async function loadGoalsByTurf(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("player_verified_stats").select("goals, stats_payload, venue:venues(name)").eq("player_user_id", userId).eq("sport_slug", "football");
  if (error && !error.message.includes("player_verified_stats")) return [];
  const byVenue = /* @__PURE__ */ new Map();
  for (const row of data ?? []) {
    const venue = row.venue;
    const name = venue?.name ?? "Unknown turf";
    const payload = row.stats_payload ?? {};
    const g = Number(payload.goals ?? row.goals ?? 0);
    byVenue.set(name, (byVenue.get(name) ?? 0) + g);
  }
  return [...byVenue.entries()].map(([venueName, goals]) => ({
    venueName,
    goals
  })).filter((x) => x.goals > 0).sort((a, b) => b.goals - a.goals);
}
const listInventoryFlags_createServerFn_handler = createServerRpc({
  id: "1f73c46a1510f8151d34390c8ba7cd1e491101f1be6d0914353526258afb26f4",
  name: "listInventoryFlags",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => listInventoryFlags.__executeServer(opts));
const listInventoryFlags = createServerFn({
  method: "GET"
}).handler(listInventoryFlags_createServerFn_handler, async () => ({
  flags: INVENTORY_FLAGS
}));
const listInventoryClubs_createServerFn_handler = createServerRpc({
  id: "636d2e263181f19c1d956db121a1e3ec6198d04dce469bfc83e4755ed63ee019",
  name: "listInventoryClubs",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => listInventoryClubs.__executeServer(opts));
const listInventoryClubs = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  sport: sportSchema.optional()
}).parse(input ?? {})).handler(listInventoryClubs_createServerFn_handler, async ({
  data
}) => ({
  clubs: data.sport ? getClubsForSport(data.sport) : INVENTORY_CLUBS
}));
const listAvatarInventory_createServerFn_handler = createServerRpc({
  id: "cc62aff522739d755b734b1530a638cdf386917eb48781f92612adc3bfd89e83",
  name: "listAvatarInventory",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => listAvatarInventory.__executeServer(opts));
const listAvatarInventory = createServerFn({
  method: "GET"
}).handler(listAvatarInventory_createServerFn_handler, async () => ({
  avatars: AVATAR_INVENTORY
}));
const getMyPlayerDashboard_createServerFn_handler = createServerRpc({
  id: "2958c4a5ec96039e4f720484041aea09a6ad24d061f2d8d835fdd6cfa68ae6dd",
  name: "getMyPlayerDashboard",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => getMyPlayerDashboard.__executeServer(opts));
const getMyPlayerDashboard = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyPlayerDashboard_createServerFn_handler, async ({
  context
}) => {
  const enabled = await playerCardsEnabled();
  const {
    data: profile,
    error
  } = await context.supabase.from("profiles").select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id").eq("id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  const cards = {};
  if (enabled) {
    for (const sport of PLAYER_SPORT_SLUGS) {
      const row = await loadSportCard(context.userId, sport);
      const verified = await loadVerified(context.userId, sport);
      const scoring = sport === "cricket" || sport === "football" ? await loadScoringStats(context.userId, sport) : {};
      const stats = mergeScoringIntoVerified(sport, verified, scoring);
      const view = enrichCard(sport, row, profile, stats);
      if (view) cards[sport] = view;
    }
  }
  const matches = await loadMatchHistory(context.userId);
  const goalsByTurf = enabled ? await loadGoalsByTurf(context.userId) : [];
  return {
    profile,
    cards,
    sports: PLAYER_SPORT_SLUGS.map((slug) => SPORT_CONFIGS[slug]),
    matches,
    goalsByTurf,
    publicUrl: profile?.username ? `/players/${profile.username}` : null,
    migrationRequired: !enabled
  };
});
const getPlayerProfileBySport_createServerFn_handler = createServerRpc({
  id: "19d7fac64f903555043b2a3021143dbb63d90d8a812494154aa1741c9e324462",
  name: "getPlayerProfileBySport",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => getPlayerProfileBySport.__executeServer(opts));
const getPlayerProfileBySport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  sport: sportSchema
}).parse(input)).handler(getPlayerProfileBySport_createServerFn_handler, async ({
  context,
  data
}) => {
  if (!await playerCardsEnabled()) throw new Error("Player cards migration required");
  const {
    data: profile
  } = await context.supabase.from("profiles").select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id").eq("id", context.userId).maybeSingle();
  const row = await loadSportCard(context.userId, data.sport);
  const verified = await loadVerified(context.userId, data.sport);
  const scoring = data.sport === "cricket" || data.sport === "football" ? await loadScoringStats(context.userId, data.sport) : {};
  return enrichCard(data.sport, row, profile, mergeScoringIntoVerified(data.sport, verified, scoring));
});
const updatePlayerProfileSettings_createServerFn_handler = createServerRpc({
  id: "2a8e6513cc7d62bc287a54ff608ec0227c2972f5ca6899a7bc0b40387924e631",
  name: "updatePlayerProfileSettings",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => updatePlayerProfileSettings.__executeServer(opts));
const updatePlayerProfileSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  sport: sportSchema
}).and(settingsSchema).parse(input)).handler(updatePlayerProfileSettings_createServerFn_handler, async ({
  context,
  data
}) => {
  if (!await playerCardsEnabled()) throw new Error("Player cards migration required");
  const sport = data.sport;
  const config = getSportConfig(sport);
  if (data.username) {
    const {
      data: taken
    } = await supabaseAdmin.from("profiles").select("id").eq("username", data.username.toLowerCase()).neq("id", context.userId).maybeSingle();
    if (taken) throw new Error("Username is already taken");
  }
  const profilePatch = {
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.username != null) profilePatch.username = data.username.toLowerCase();
  if (data.full_name != null) profilePatch.full_name = data.full_name.trim();
  if (data.bio !== void 0) profilePatch.bio = data.bio;
  if (data.city !== void 0) profilePatch.city = data.city;
  if (data.avatar_inventory_id !== void 0) profilePatch.avatar_inventory_id = data.avatar_inventory_id;
  if (data.avatar_url !== void 0) profilePatch.avatar_url = data.avatar_url;
  const {
    error: profileErr
  } = await context.supabase.from("profiles").update(profilePatch).eq("id", context.userId);
  if (profileErr) throw new Error(profileErr.message);
  const ratings = {
    ...config.defaultRatings,
    ...data.card_ratings ?? {}
  };
  const incomingSettings = data.sport_settings ?? {};
  const sportSettings = {
    ...incomingSettings,
    skill_level: parseSkillLevel(incomingSettings.skill_level)
  };
  const cardPayload = {
    user_id: context.userId,
    sport_slug: sport,
    club_id: config.showClub ? data.club_id ?? getClubsForSport(sport).at(-1)?.id : null,
    flag_id: data.flag_id,
    position: data.position,
    jersey_number: data.jersey_number ?? null,
    preferred_foot: sport === "football" ? data.preferred_foot ?? null : null,
    card_ratings: ratings,
    sport_settings: sportSettings,
    is_public: data.is_public,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    data: row,
    error: cardErr
  } = await context.supabase.from("player_cards").upsert(cardPayload, {
    onConflict: "user_id,sport_slug"
  }).select("*").single();
  if (cardErr) throw new Error(cardErr.message);
  const {
    data: profile
  } = await context.supabase.from("profiles").select("id, username, full_name, email, bio, city, avatar_url, avatar_inventory_id").eq("id", context.userId).maybeSingle();
  const verified = await loadVerified(context.userId, sport);
  const scoring = sport === "cricket" || sport === "football" ? await loadScoringStats(context.userId, sport) : {};
  return {
    card: enrichCard(sport, row, profile, mergeScoringIntoVerified(sport, verified, scoring)),
    publicUrl: profile?.username ? `/players/${profile.username}?sport=${sport}` : null
  };
});
const getPublicPlayerProfile_createServerFn_handler = createServerRpc({
  id: "3f9b04f689a33b2a9c2deb83428d2775fab9cd6c2c0b40960b683f7a7229f854",
  name: "getPublicPlayerProfile",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => getPublicPlayerProfile.__executeServer(opts));
const getPublicPlayerProfile = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  username: stringType().min(3).max(30),
  sport: sportSchema.optional()
}).parse(input)).handler(getPublicPlayerProfile_createServerFn_handler, async ({
  data
}) => {
  if (!await playerCardsEnabled()) return null;
  const profile = await loadProfileByUsername(data.username);
  if (!profile) return null;
  const activeSport = data.sport && isPlayerSportSlug(data.sport) ? data.sport : "football";
  const cards = {};
  for (const sport of PLAYER_SPORT_SLUGS) {
    const row = await loadSportCard(profile.id, sport, true);
    if (!row) continue;
    const verified = await loadVerified(profile.id, sport);
    const scoring = sport === "cricket" || sport === "football" ? await loadScoringStats(profile.id, sport) : {};
    const stats = mergeScoringIntoVerified(sport, verified, scoring);
    const view = enrichCard(sport, row, profile, stats);
    if (view) cards[sport] = view;
  }
  if (Object.keys(cards).length === 0) return null;
  const matches = await loadMatchHistory(profile.id);
  return {
    activeSport: cards[activeSport] ? activeSport : Object.keys(cards)[0],
    cards,
    matches,
    publicUrl: `/players/${profile.username}`
  };
});
const listPlayerMatches_createServerFn_handler = createServerRpc({
  id: "ec685edcae7fa2e4d44da2ca1fac5f78105f78a733aedb622145b9ec62a28779",
  name: "listPlayerMatches",
  filename: "src/lib/player-card.functions.ts"
}, (opts) => listPlayerMatches.__executeServer(opts));
const listPlayerMatches = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  sport: sportSchema.optional()
}).parse(input ?? {})).handler(listPlayerMatches_createServerFn_handler, async ({
  context,
  data
}) => {
  let q = supabaseAdmin.from("player_match_history").select("*").eq("player_user_id", context.userId).order("match_date", {
    ascending: false
  }).limit(30);
  if (data.sport) q = q.eq("sport_slug", data.sport);
  const {
    data: rows,
    error
  } = await q;
  if (error && !error.message.includes("player_match_history")) throw new Error(error.message);
  return mapMatches(rows ?? []);
});
function mapMatches(rows) {
  return rows.map((r) => ({
    id: r.id,
    sportSlug: r.sport_slug,
    matchDate: r.match_date,
    teamName: r.team_name,
    teamIcon: r.team_icon ?? null,
    playerScore: Number(r.player_score ?? 0),
    opponentName: r.opponent_name,
    opponentIcon: r.opponent_icon ?? null,
    opponentScore: Number(r.opponent_score ?? 0)
  }));
}
export {
  getMyPlayerDashboard_createServerFn_handler,
  getPlayerProfileBySport_createServerFn_handler,
  getPublicPlayerProfile_createServerFn_handler,
  listAvatarInventory_createServerFn_handler,
  listInventoryClubs_createServerFn_handler,
  listInventoryFlags_createServerFn_handler,
  listPlayerMatches_createServerFn_handler,
  updatePlayerProfileSettings_createServerFn_handler
};
