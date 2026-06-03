import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateBookingTotal, loadVenuePricing } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/services/razorpay";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function perPersonShare(total: number, maxPlayers: number, count: number) {
  const per = total > 0 ? Math.ceil(total / Math.max(1, maxPlayers)) : 0;
  return per * count;
}

async function getBookingWithVenue(bookingId: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*, venue:venues(id, name, slug, city, max_players_allowed, price_per_hour, sport:sports(name, slug, icon))")
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Booking not found");
  return data;
}

export const listOpenLobbies = createServerFn({ method: "GET" })
  .inputValidator((input: { sport?: string; date?: string } | undefined) =>
    z.object({
      sport: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const minDate = data.date ?? todayISO();
    let q = supabaseAdmin
      .from("bookings")
      .select(
        "id, booking_date, start_hour, end_hour, player_count, player_names, total_price, is_open_lobby, user_id, venue:venues(id, name, slug, city, address, max_players_allowed, price_per_hour, sport:sports(name, slug, icon))",
      )
      .eq("is_open_lobby", true)
      .eq("status", "confirmed")
      .gte("booking_date", minDate)
      .order("booking_date", { ascending: true })
      .limit(100);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const filtered = (rows ?? []).filter((b: any) => {
      const max = Math.max(1, b.venue?.max_players_allowed ?? 1);
      return (b.player_count ?? 0) < max;
    }).filter((b: any) => !data.sport || b.venue?.sport?.slug === data.sport);

    const hostIds = Array.from(new Set(filtered.map((b: any) => b.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", hostIds.length ? hostIds : ["00000000-0000-0000-0000-000000000000"]);

    const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return filtered.map((b: any) => {
      const max = Math.max(1, b.venue?.max_players_allowed ?? 1);
      return {
        ...b,
        host: pmap.get(b.user_id) ?? null,
        spots_open: max - (b.player_count ?? 0),
        spots_total: max,
      };
    });
  });

export const submitLobbyQuery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { bookingId: string; playerCount: number; playerNames: string[] }) =>
      z
        .object({
          bookingId: z.string().uuid(),
          playerCount: z.number().int().min(1).max(100),
          playerNames: z.array(z.string().trim().min(1).max(60)),
        })
        .refine((v) => v.playerNames.length === v.playerCount, {
          message: "Provide one name per player",
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const booking = await getBookingWithVenue(data.bookingId);
    if (!booking.is_open_lobby) throw new Error("This match is not open for join requests");
    if (booking.user_id === context.userId) throw new Error("You cannot join your own lobby");
    if (booking.status !== "confirmed") throw new Error("This match is no longer active");
    if (booking.booking_date < todayISO()) throw new Error("This match has already passed");

    const max = Math.max(1, booking.venue?.max_players_allowed ?? 1);
    const remaining = max - (booking.player_count ?? 0);
    if (data.playerCount > remaining) {
      throw new Error(`Only ${remaining} spot${remaining === 1 ? "" : "s"} left in this match`);
    }

    const names = data.playerNames.map((n) => n.trim());
    const unique = new Set(names.map((n) => n.toLowerCase()));
    if (unique.size !== names.length) throw new Error("Each player name must be unique");

    const existing = booking.player_names ?? [];
    for (const n of names) {
      if (existing.some((e: string) => e.toLowerCase() === n.toLowerCase())) {
        throw new Error(`"${n}" is already registered on this match`);
      }
    }

    const { data: dup } = await supabaseAdmin
      .from("lobby_queries")
      .select("id")
      .eq("booking_id", data.bookingId)
      .eq("seeker_id", context.userId)
      .eq("status", "pending")
      .maybeSingle();
    if (dup) throw new Error("You already have a pending request for this match");

    const share = perPersonShare(booking.total_price, max, data.playerCount);
    const order = await createRazorpayOrder(share * 100, `lq_${Date.now()}`);
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: context.userId,
        amount: share,
        razorpay_order_id: order.id,
        status: process.env.RAZORPAY_KEY_ID ? "created" : "success",
      })
      .select("id")
      .single();
    if (payErr) throw new Error(payErr.message);

    const { data: query, error } = await supabaseAdmin
      .from("lobby_queries")
      .insert({
        booking_id: data.bookingId,
        seeker_id: context.userId,
        player_count: data.playerCount,
        player_names: names,
        status: "pending",
        payment_id: payment.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: booking.user_id,
      title: "New join request",
      message: `Someone wants to join your match on ${booking.booking_date} with ${data.playerCount} player(s).`,
      type: "booking",
    });

    return { queryId: query.id, amount: share };
  });

export const acceptLobbyQuery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { queryId: string }) => z.object({ queryId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: query, error: qErr } = await supabaseAdmin
      .from("lobby_queries")
      .select("*")
      .eq("id", data.queryId)
      .maybeSingle();
    if (qErr || !query) throw new Error("Request not found");
    if (query.status !== "pending") throw new Error("This request is no longer pending");

    const booking = await getBookingWithVenue(query.booking_id);
    if (booking.user_id !== context.userId) throw new Error("Only the match host can accept requests");

    const max = Math.max(1, booking.venue?.max_players_allowed ?? 1);
    const newTotal = (booking.player_count ?? 0) + query.player_count;
    if (newTotal > max) {
      await supabaseAdmin.from("lobby_queries").update({ status: "expired" }).eq("id", query.id);
      if (query.payment_id) {
        await supabaseAdmin.from("payments").update({ status: "cancelled" }).eq("id", query.payment_id);
      }
      throw new Error("Not enough capacity left for this group");
    }

    const mergedNames = [...(booking.player_names ?? []), ...(query.player_names ?? [])];
    const { error: bErr } = await supabaseAdmin
      .from("bookings")
      .update({ player_count: newTotal, player_names: mergedNames })
      .eq("id", booking.id);
    if (bErr) throw new Error(bErr.message);

    await supabaseAdmin.from("lobby_queries").update({ status: "accepted" }).eq("id", query.id);

    if (newTotal >= max) {
      await supabaseAdmin
        .from("lobby_queries")
        .update({ status: "expired" })
        .eq("booking_id", booking.id)
        .eq("status", "pending")
        .neq("id", query.id);
      const { data: expired } = await supabaseAdmin
        .from("lobby_queries")
        .select("payment_id")
        .eq("booking_id", booking.id)
        .eq("status", "expired");
      for (const row of expired ?? []) {
        if (row.payment_id) {
          await supabaseAdmin.from("payments").update({ status: "cancelled" }).eq("id", row.payment_id);
        }
      }
    }

    if (query.payment_id) {
      await supabaseAdmin.from("payments").update({ status: "success", booking_id: booking.id }).eq("id", query.payment_id);
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: query.seeker_id,
      title: "Join request approved",
      message: `You're in! Match on ${booking.booking_date} at ${booking.venue?.name}.`,
      type: "booking",
    });

    return { ok: true };
  });

export const declineLobbyQuery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { queryId: string }) => z.object({ queryId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: query, error: qErr } = await supabaseAdmin
      .from("lobby_queries")
      .select("*")
      .eq("id", data.queryId)
      .maybeSingle();
    if (qErr || !query) throw new Error("Request not found");
    if (query.status !== "pending") throw new Error("This request is no longer pending");

    const booking = await getBookingWithVenue(query.booking_id);
    if (booking.user_id !== context.userId) throw new Error("Only the match host can decline requests");

    await supabaseAdmin.from("lobby_queries").update({ status: "rejected" }).eq("id", query.id);
    if (query.payment_id) {
      await supabaseAdmin.from("payments").update({ status: "cancelled" }).eq("id", query.payment_id);
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: query.seeker_id,
      title: "Join request declined",
      message: `Your request to join the match on ${booking.booking_date} was declined.`,
      type: "booking",
    });

    return { ok: true };
  });

export const listPendingQueriesForHost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: myBookings } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("user_id", context.userId)
      .eq("is_open_lobby", true);
    const ids = (myBookings ?? []).map((b) => b.id);
    if (!ids.length) return [];

    const { data: queries, error } = await supabaseAdmin
      .from("lobby_queries")
      .select("*, booking:bookings(booking_date, start_hour, end_hour, venue:venues(name))")
      .in("booking_id", ids)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const seekerIds = Array.from(new Set((queries ?? []).map((q) => q.seeker_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", seekerIds.length ? seekerIds : ["00000000-0000-0000-0000-000000000000"]);

    const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (queries ?? []).map((q) => ({ ...q, seeker: pmap.get(q.seeker_id) ?? null }));
  });

export const listMyLobbyQueries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("lobby_queries")
      .select("*, booking:bookings(booking_date, start_hour, end_hour, player_count, venue:venues(name, slug, city, max_players_allowed, sport:sports(name, icon))")
      .eq("seeker_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
