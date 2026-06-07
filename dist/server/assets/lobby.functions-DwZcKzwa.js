import { c as createServerRpc } from "./createServerRpc-CwQVcAHq.js";
import { l as createServerFn } from "./server-Dio2SAfm.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { o as objectType, s as stringType, d as requireSupabaseAuth, b as arrayType, n as numberType } from "./auth-middleware-BZQ_Ksej.js";
import { c as createRazorpayOrder } from "./razorpay-DwVM9bks.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "node:crypto";
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function perPersonShare(total, maxPlayers, count) {
  const per = total > 0 ? Math.ceil(total / Math.max(1, maxPlayers)) : 0;
  return per * count;
}
async function getBookingWithVenue(bookingId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("bookings").select("*, venue:venues(id, name, slug, city, max_players_allowed, price_per_hour, sport:sports(name, slug, icon))").eq("id", bookingId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Booking not found");
  return data;
}
const listOpenLobbies_createServerFn_handler = createServerRpc({
  id: "935e9ed4bf288633bf020f86bbde98f9dde5828686a2587dc16ebf5ab725d993",
  name: "listOpenLobbies",
  filename: "src/lib/lobby.functions.ts"
}, (opts) => listOpenLobbies.__executeServer(opts));
const listOpenLobbies = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  sport: stringType().optional(),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).parse(input ?? {})).handler(listOpenLobbies_createServerFn_handler, async ({
  data
}) => {
  const minDate = data.date ?? todayISO();
  let q = supabaseAdmin.from("bookings").select("id, booking_date, start_hour, end_hour, player_count, player_names, total_price, is_open_lobby, user_id, venue:venues(id, name, slug, city, address, max_players_allowed, price_per_hour, sport:sports(name, slug, icon))").eq("is_open_lobby", true).eq("status", "confirmed").gte("booking_date", minDate).order("booking_date", {
    ascending: true
  }).limit(100);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const filtered = (rows ?? []).filter((b) => {
    const max = Math.max(1, b.venue?.max_players_allowed ?? 1);
    return (b.player_count ?? 0) < max;
  }).filter((b) => !data.sport || b.venue?.sport?.slug === data.sport);
  const hostIds = Array.from(new Set(filtered.map((b) => b.user_id)));
  const {
    data: profiles
  } = await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", hostIds.length ? hostIds : ["00000000-0000-0000-0000-000000000000"]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return filtered.map((b) => {
    const max = Math.max(1, b.venue?.max_players_allowed ?? 1);
    return {
      ...b,
      host: pmap.get(b.user_id) ?? null,
      spots_open: max - (b.player_count ?? 0),
      spots_total: max
    };
  });
});
const submitLobbyQuery_createServerFn_handler = createServerRpc({
  id: "293ee13157740e5d3f3f624e5c4ac8d387bd5856c402f1b5ea71d90185017737",
  name: "submitLobbyQuery",
  filename: "src/lib/lobby.functions.ts"
}, (opts) => submitLobbyQuery.__executeServer(opts));
const submitLobbyQuery = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  bookingId: stringType().uuid(),
  playerCount: numberType().int().min(1).max(100),
  playerNames: arrayType(stringType().trim().min(1).max(60))
}).refine((v) => v.playerNames.length === v.playerCount, {
  message: "Provide one name per player"
}).parse(input)).handler(submitLobbyQuery_createServerFn_handler, async ({
  data,
  context
}) => {
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
    if (existing.some((e) => e.toLowerCase() === n.toLowerCase())) {
      throw new Error(`"${n}" is already registered on this match`);
    }
  }
  const {
    data: dup
  } = await supabaseAdmin.from("lobby_queries").select("id").eq("booking_id", data.bookingId).eq("seeker_id", context.userId).eq("status", "pending").maybeSingle();
  if (dup) throw new Error("You already have a pending request for this match");
  const share = perPersonShare(booking.total_price, max, data.playerCount);
  const order = await createRazorpayOrder(share * 100, `lq_${Date.now()}`);
  const {
    data: payment,
    error: payErr
  } = await supabaseAdmin.from("payments").insert({
    user_id: context.userId,
    amount: share,
    razorpay_order_id: order.id,
    status: process.env.RAZORPAY_KEY_ID ? "created" : "success"
  }).select("id").single();
  if (payErr) throw new Error(payErr.message);
  const {
    data: query,
    error
  } = await supabaseAdmin.from("lobby_queries").insert({
    booking_id: data.bookingId,
    seeker_id: context.userId,
    player_count: data.playerCount,
    player_names: names,
    status: "pending",
    payment_id: payment.id
  }).select("id").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("notifications").insert({
    user_id: booking.user_id,
    title: "New join request",
    message: `Someone wants to join your match on ${booking.booking_date} with ${data.playerCount} player(s).`,
    type: "booking"
  });
  return {
    queryId: query.id,
    amount: share
  };
});
const acceptLobbyQuery_createServerFn_handler = createServerRpc({
  id: "6fcdff62938a004312bca1ede1ff796eecd88da10b0236c7a673c2cbcb38ef13",
  name: "acceptLobbyQuery",
  filename: "src/lib/lobby.functions.ts"
}, (opts) => acceptLobbyQuery.__executeServer(opts));
const acceptLobbyQuery = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  queryId: stringType().uuid()
}).parse(input)).handler(acceptLobbyQuery_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: query,
    error: qErr
  } = await supabaseAdmin.from("lobby_queries").select("*").eq("id", data.queryId).maybeSingle();
  if (qErr || !query) throw new Error("Request not found");
  if (query.status !== "pending") throw new Error("This request is no longer pending");
  const booking = await getBookingWithVenue(query.booking_id);
  if (booking.user_id !== context.userId) throw new Error("Only the match host can accept requests");
  const max = Math.max(1, booking.venue?.max_players_allowed ?? 1);
  const newTotal = (booking.player_count ?? 0) + query.player_count;
  if (newTotal > max) {
    await supabaseAdmin.from("lobby_queries").update({
      status: "expired"
    }).eq("id", query.id);
    if (query.payment_id) {
      await supabaseAdmin.from("payments").update({
        status: "cancelled"
      }).eq("id", query.payment_id);
    }
    throw new Error("Not enough capacity left for this group");
  }
  const mergedNames = [...booking.player_names ?? [], ...query.player_names ?? []];
  const {
    error: bErr
  } = await supabaseAdmin.from("bookings").update({
    player_count: newTotal,
    player_names: mergedNames
  }).eq("id", booking.id);
  if (bErr) throw new Error(bErr.message);
  await supabaseAdmin.from("lobby_queries").update({
    status: "accepted"
  }).eq("id", query.id);
  if (newTotal >= max) {
    await supabaseAdmin.from("lobby_queries").update({
      status: "expired"
    }).eq("booking_id", booking.id).eq("status", "pending").neq("id", query.id);
    const {
      data: expired
    } = await supabaseAdmin.from("lobby_queries").select("payment_id").eq("booking_id", booking.id).eq("status", "expired");
    for (const row of expired ?? []) {
      if (row.payment_id) {
        await supabaseAdmin.from("payments").update({
          status: "cancelled"
        }).eq("id", row.payment_id);
      }
    }
  }
  if (query.payment_id) {
    await supabaseAdmin.from("payments").update({
      status: "success",
      booking_id: booking.id
    }).eq("id", query.payment_id);
  }
  await supabaseAdmin.from("notifications").insert({
    user_id: query.seeker_id,
    title: "Join request approved",
    message: `You're in! Match on ${booking.booking_date} at ${booking.venue?.name}.`,
    type: "booking"
  });
  return {
    ok: true
  };
});
const declineLobbyQuery_createServerFn_handler = createServerRpc({
  id: "37147384698a6c99370205aa64e0c96d7429d007ec90015b7093842ba93fba71",
  name: "declineLobbyQuery",
  filename: "src/lib/lobby.functions.ts"
}, (opts) => declineLobbyQuery.__executeServer(opts));
const declineLobbyQuery = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  queryId: stringType().uuid()
}).parse(input)).handler(declineLobbyQuery_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: query,
    error: qErr
  } = await supabaseAdmin.from("lobby_queries").select("*").eq("id", data.queryId).maybeSingle();
  if (qErr || !query) throw new Error("Request not found");
  if (query.status !== "pending") throw new Error("This request is no longer pending");
  const booking = await getBookingWithVenue(query.booking_id);
  if (booking.user_id !== context.userId) throw new Error("Only the match host can decline requests");
  await supabaseAdmin.from("lobby_queries").update({
    status: "rejected"
  }).eq("id", query.id);
  if (query.payment_id) {
    await supabaseAdmin.from("payments").update({
      status: "cancelled"
    }).eq("id", query.payment_id);
  }
  await supabaseAdmin.from("notifications").insert({
    user_id: query.seeker_id,
    title: "Join request declined",
    message: `Your request to join the match on ${booking.booking_date} was declined.`,
    type: "booking"
  });
  return {
    ok: true
  };
});
const listPendingQueriesForHost_createServerFn_handler = createServerRpc({
  id: "b08b1b66039be2767405aaeae095c73cd59f6f1e2ba961592d4fc442ba67d348",
  name: "listPendingQueriesForHost",
  filename: "src/lib/lobby.functions.ts"
}, (opts) => listPendingQueriesForHost.__executeServer(opts));
const listPendingQueriesForHost = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPendingQueriesForHost_createServerFn_handler, async ({
  context
}) => {
  const {
    data: myBookings
  } = await supabaseAdmin.from("bookings").select("id").eq("user_id", context.userId).eq("is_open_lobby", true);
  const ids = (myBookings ?? []).map((b) => b.id);
  if (!ids.length) return [];
  const {
    data: queries,
    error
  } = await supabaseAdmin.from("lobby_queries").select("*, booking:bookings(booking_date, start_hour, end_hour, venue:venues(name))").in("booking_id", ids).eq("status", "pending").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const seekerIds = Array.from(new Set((queries ?? []).map((q) => q.seeker_id)));
  const {
    data: profiles
  } = await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", seekerIds.length ? seekerIds : ["00000000-0000-0000-0000-000000000000"]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return (queries ?? []).map((q) => ({
    ...q,
    seeker: pmap.get(q.seeker_id) ?? null
  }));
});
const listMyLobbyQueries_createServerFn_handler = createServerRpc({
  id: "21958eddd19d201430455822fd30e5165ec95b250ccfd6bfb812746bcf794ec9",
  name: "listMyLobbyQueries",
  filename: "src/lib/lobby.functions.ts"
}, (opts) => listMyLobbyQueries.__executeServer(opts));
const listMyLobbyQueries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyLobbyQueries_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await supabaseAdmin.from("lobby_queries").select("*, booking:bookings(booking_date, start_hour, end_hour, player_count, venue:venues(name, slug, city, max_players_allowed, sport:sports(name, icon))").eq("seeker_id", context.userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
export {
  acceptLobbyQuery_createServerFn_handler,
  declineLobbyQuery_createServerFn_handler,
  listMyLobbyQueries_createServerFn_handler,
  listOpenLobbies_createServerFn_handler,
  listPendingQueriesForHost_createServerFn_handler,
  submitLobbyQuery_createServerFn_handler
};
