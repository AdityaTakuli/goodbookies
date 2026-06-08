import { c as createServerRpc } from "./createServerRpc-D7vmW7QU.js";
import { l as createServerFn } from "./server-BoYkhmMb.js";
import { r as requireSupabaseAuth } from "./auth-middleware-D6oeupdG.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { b as getClubById } from "./catalog-Du0eftkI.js";
import { P as PLAYER_SPORT_SLUGS } from "./player-sports-D0yo17RI.js";
import { e as enumType, o as objectType, s as stringType, n as numberType, r as recordType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
async function assertApprovedOwner(userId) {
  const {
    data
  } = await supabaseAdmin.from("owners").select("id, status").eq("id", userId).maybeSingle();
  if (!data || data.status !== "approved") throw new Error("Forbidden: approved owner required");
}
async function assertOwnerVenue(userId, venueId) {
  await assertApprovedOwner(userId);
  const {
    data
  } = await supabaseAdmin.from("venues").select("id, owner_id, name, sport:sports(slug)").eq("id", venueId).maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Forbidden: not your venue");
  return data;
}
const sportSchema = enumType(PLAYER_SPORT_SLUGS);
const verifySchema = objectType({
  playerUserId: stringType().uuid(),
  venueId: stringType().uuid(),
  sport: sportSchema,
  bookingId: stringType().uuid().optional(),
  matchDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  statsPayload: recordType(stringType(), numberType().nonnegative()),
  // Match history scoreline
  teamName: stringType().min(1).max(120),
  teamIcon: stringType().max(16).optional(),
  playerScore: numberType().int().min(0),
  opponentName: stringType().min(1).max(120),
  opponentIcon: stringType().max(16).optional(),
  opponentScore: numberType().int().min(0),
  notes: stringType().max(500).optional()
});
const ownerListVenuesForStats_createServerFn_handler = createServerRpc({
  id: "42965ee81dff5a7450555048a069263e4294afeb0ba97b60c6a58b1a41b56a22",
  name: "ownerListVenuesForStats",
  filename: "src/lib/owner-player-stats.functions.ts"
}, (opts) => ownerListVenuesForStats.__executeServer(opts));
const ownerListVenuesForStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(ownerListVenuesForStats_createServerFn_handler, async ({
  context
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("venues").select("id, name, city, sport:sports(name, slug)").eq("owner_id", context.userId).eq("is_active", true).order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});
const ownerLookupPlayerByUsername_createServerFn_handler = createServerRpc({
  id: "2ab013211392959ba12dab213e93e7cef2ac367e0b98b50bac4ed4ac2a57b567",
  name: "ownerLookupPlayerByUsername",
  filename: "src/lib/owner-player-stats.functions.ts"
}, (opts) => ownerLookupPlayerByUsername.__executeServer(opts));
const ownerLookupPlayerByUsername = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  username: stringType().min(3).max(30)
}).parse(input)).handler(ownerLookupPlayerByUsername_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data: profile,
    error
  } = await supabaseAdmin.from("profiles").select("id, username, full_name, email").eq("username", data.username.toLowerCase()).maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile) throw new Error("Player not found");
  return profile;
});
const ownerVerifyPlayerStats_createServerFn_handler = createServerRpc({
  id: "bfbbcdd84aff9f7b493d3075dda3691157d72fc61a7cadd305a0af1d483e9916",
  name: "ownerVerifyPlayerStats",
  filename: "src/lib/owner-player-stats.functions.ts"
}, (opts) => ownerVerifyPlayerStats.__executeServer(opts));
const ownerVerifyPlayerStats = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => verifySchema.parse(input)).handler(ownerVerifyPlayerStats_createServerFn_handler, async ({
  context,
  data
}) => {
  const venue = await assertOwnerVenue(context.userId, data.venueId);
  const venueSport = venue.sport?.slug;
  if (venueSport && venueSport !== data.sport) {
    throw new Error(`This turf is for ${venueSport}, not ${data.sport}`);
  }
  const {
    data: player,
    error: pErr
  } = await supabaseAdmin.from("profiles").select("id, username, full_name").eq("id", data.playerUserId).maybeSingle();
  if (pErr || !player) throw new Error("Player not found");
  const legacyGoals = Number(data.statsPayload.goals ?? 0);
  const legacyAssists = Number(data.statsPayload.assists ?? 0);
  const legacyMatches = Number(data.statsPayload.matches ?? 1);
  const {
    data: row,
    error
  } = await supabaseAdmin.from("player_verified_stats").insert({
    player_user_id: data.playerUserId,
    sport_slug: data.sport,
    venue_id: data.venueId,
    booking_id: data.bookingId ?? null,
    verified_by: context.userId,
    match_date: data.matchDate,
    goals: legacyGoals,
    assists: legacyAssists,
    matches: legacyMatches,
    stats_payload: data.statsPayload,
    notes: data.notes ?? null
  }).select("id, created_at").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("player_match_history").insert({
    player_user_id: data.playerUserId,
    sport_slug: data.sport,
    venue_id: data.venueId,
    booking_id: data.bookingId ?? null,
    verified_by: context.userId,
    match_date: data.matchDate,
    team_name: data.teamName,
    team_icon: data.teamIcon ?? getClubById(null, data.sport).badgeEmoji,
    player_score: data.playerScore,
    opponent_name: data.opponentName,
    opponent_icon: data.opponentIcon ?? "🆚",
    opponent_score: data.opponentScore
  });
  await supabaseAdmin.from("notifications").insert({
    user_id: data.playerUserId,
    title: "Turf-verified stats added",
    message: `${venue.name} verified your ${data.sport} match results.`,
    type: "stats_verified"
  });
  return {
    ok: true,
    verificationId: row.id,
    player
  };
});
export {
  ownerListVenuesForStats_createServerFn_handler,
  ownerLookupPlayerByUsername_createServerFn_handler,
  ownerVerifyPlayerStats_createServerFn_handler
};
