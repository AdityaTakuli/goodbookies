import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getClubById } from "@/lib/inventory/catalog";
import { PLAYER_SPORT_SLUGS } from "@/lib/sports/player-sports";

async function assertApprovedOwner(userId: string) {
  const { data } = await supabaseAdmin.from("owners").select("id, status").eq("id", userId).maybeSingle();
  if (!data || data.status !== "approved") throw new Error("Forbidden: approved owner required");
}

async function assertOwnerVenue(userId: string, venueId: string) {
  await assertApprovedOwner(userId);
  const { data } = await supabaseAdmin
    .from("venues")
    .select("id, owner_id, name, sport:sports(slug)")
    .eq("id", venueId)
    .maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Forbidden: not your venue");
  return data;
}

const sportSchema = z.enum(PLAYER_SPORT_SLUGS);

const verifySchema = z.object({
  playerUserId: z.string().uuid(),
  venueId: z.string().uuid(),
  sport: sportSchema,
  bookingId: z.string().uuid().optional(),
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  statsPayload: z.record(z.string(), z.number().nonnegative()),
  // Match history scoreline
  teamName: z.string().min(1).max(120),
  teamIcon: z.string().max(16).optional(),
  playerScore: z.number().int().min(0),
  opponentName: z.string().min(1).max(120),
  opponentIcon: z.string().max(16).optional(),
  opponentScore: z.number().int().min(0),
  notes: z.string().max(500).optional(),
});

export const ownerListVenuesForStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedOwner(context.userId);
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select("id, name, city, sport:sports(name, slug)")
      .eq("owner_id", context.userId)
      .eq("is_active", true)
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const ownerLookupPlayerByUsername = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { username: string }) =>
    z.object({ username: z.string().min(3).max(30) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertApprovedOwner(context.userId);
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, full_name, email")
      .eq("username", data.username.toLowerCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) throw new Error("Player not found");
    return profile;
  });

/** Turf owners only — verified stats + match history (players cannot write these). */
export const ownerVerifyPlayerStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => verifySchema.parse(input))
  .handler(async ({ context, data }) => {
    const venue = await assertOwnerVenue(context.userId, data.venueId);
    const venueSport = (venue as any).sport?.slug;
    if (venueSport && venueSport !== data.sport) {
      throw new Error(`This turf is for ${venueSport}, not ${data.sport}`);
    }

    const { data: player, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, username, full_name")
      .eq("id", data.playerUserId)
      .maybeSingle();
    if (pErr || !player) throw new Error("Player not found");

    const legacyGoals = Number(data.statsPayload.goals ?? 0);
    const legacyAssists = Number(data.statsPayload.assists ?? 0);
    const legacyMatches = Number(data.statsPayload.matches ?? 1);

    const { data: row, error } = await supabaseAdmin
      .from("player_verified_stats")
      .insert({
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
        notes: data.notes ?? null,
      })
      .select("id, created_at")
      .single();
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
      opponent_score: data.opponentScore,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: data.playerUserId,
      title: "Turf-verified stats added",
      message: `${venue.name} verified your ${data.sport} match results.`,
      type: "stats_verified",
    });

    return { ok: true, verificationId: row.id, player };
  });
