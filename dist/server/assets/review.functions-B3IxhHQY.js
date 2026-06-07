import { c as createServerRpc } from "./createServerRpc-D3buN9M5.js";
import { l as createServerFn } from "./server-BTKa9lBV.js";
import { o as objectType, s as stringType, n as numberType, d as requireSupabaseAuth } from "./auth-middleware-s-UfTcdV.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
let reviewsTableReady = null;
async function venueReviewsEnabled() {
  if (reviewsTableReady != null) return reviewsTableReady;
  const {
    error
  } = await supabaseAdmin.from("venue_reviews").select("id").limit(1);
  reviewsTableReady = !error?.message?.includes("venue_reviews");
  return reviewsTableReady;
}
const emptySummary = {
  averageRating: null,
  totalReviews: 0,
  distribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  }
};
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function isBookingCompleted(booking) {
  if (booking.status !== "confirmed") return false;
  const today = todayISO();
  if (booking.booking_date < today) return true;
  if (booking.booking_date > today) return false;
  return booking.end_hour <= (/* @__PURE__ */ new Date()).getHours();
}
async function userHasCompletedBooking(userId, venueId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("bookings").select("id, booking_date, end_hour, status").eq("user_id", userId).eq("venue_id", venueId).eq("status", "confirmed").order("booking_date", {
    ascending: false
  }).limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []).find((b) => isBookingCompleted(b)) ?? null;
}
const getVenueReviewSummary_createServerFn_handler = createServerRpc({
  id: "22528b7ac4107cf764eb776714a3451ede0a14010118f92adaf42bb45b0b7b27",
  name: "getVenueReviewSummary",
  filename: "src/lib/review.functions.ts"
}, (opts) => getVenueReviewSummary.__executeServer(opts));
const getVenueReviewSummary = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid()
}).parse(input)).handler(getVenueReviewSummary_createServerFn_handler, async ({
  data
}) => {
  if (!await venueReviewsEnabled()) return emptySummary;
  let venue = null;
  const withCount = await supabaseAdmin.from("venues").select("rating, review_count").eq("id", data.venueId).maybeSingle();
  if (withCount.error?.message.includes("review_count")) {
    const fallback = await supabaseAdmin.from("venues").select("rating").eq("id", data.venueId).maybeSingle();
    if (fallback.error) throw new Error(fallback.error.message);
    venue = fallback.data;
  } else {
    if (withCount.error) throw new Error(withCount.error.message);
    venue = withCount.data;
  }
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("venue_reviews").select("rating").eq("venue_id", data.venueId);
  if (error) throw new Error(error.message);
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };
  for (const row of rows ?? []) {
    const star = Number(row.rating);
    if (star >= 1 && star <= 5) distribution[star] += 1;
  }
  const total = venue?.review_count ?? rows?.length ?? 0;
  return {
    averageRating: venue?.rating != null ? Number(venue.rating) : null,
    totalReviews: total,
    distribution
  };
});
const listVenueReviews_createServerFn_handler = createServerRpc({
  id: "0393ae12b7e9ee8887eb8f3d2b7472bd5365ed46889b244c7fb2a1a5acf1cbfd",
  name: "listVenueReviews",
  filename: "src/lib/review.functions.ts"
}, (opts) => listVenueReviews.__executeServer(opts));
const listVenueReviews = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  limit: numberType().int().min(1).max(50).default(20)
}).parse(input)).handler(listVenueReviews_createServerFn_handler, async ({
  data
}) => {
  if (!await venueReviewsEnabled()) return [];
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("venue_reviews").select("id, rating, comment, created_at, updated_at, user_id").eq("venue_id", data.venueId).order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (error) throw new Error(error.message);
  const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
  const profileMap = /* @__PURE__ */ new Map();
  if (userIds.length > 0) {
    const {
      data: profiles
    } = await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds);
    for (const p of profiles ?? []) profileMap.set(p.id, p);
  }
  return (rows ?? []).map((r) => {
    const profile = profileMap.get(r.user_id);
    const name = profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Player";
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      authorName: name,
      isEdited: r.updated_at !== r.created_at
    };
  });
});
const getMyVenueReviewState_createServerFn_handler = createServerRpc({
  id: "d12ba334c8b70e2cbd1c9be5606f6f7e247300938cf0719ee13a33d44e55ad1a",
  name: "getMyVenueReviewState",
  filename: "src/lib/review.functions.ts"
}, (opts) => getMyVenueReviewState.__executeServer(opts));
const getMyVenueReviewState = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid()
}).parse(input)).handler(getMyVenueReviewState_createServerFn_handler, async ({
  context,
  data
}) => {
  if (!await venueReviewsEnabled()) {
    return {
      canReview: false,
      myReview: null
    };
  }
  const completedBooking = await userHasCompletedBooking(context.userId, data.venueId);
  const {
    data: existing,
    error
  } = await context.supabase.from("venue_reviews").select("id, rating, comment, created_at, updated_at").eq("venue_id", data.venueId).eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    canReview: Boolean(completedBooking),
    myReview: existing ? {
      id: existing.id,
      rating: existing.rating,
      comment: existing.comment,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at
    } : null
  };
});
const submitVenueReview_createServerFn_handler = createServerRpc({
  id: "a286131a78b19b5f9476fb6e0dc67d4962d48d92503ee648cf6b354af0e98b8d",
  name: "submitVenueReview",
  filename: "src/lib/review.functions.ts"
}, (opts) => submitVenueReview.__executeServer(opts));
const submitVenueReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  rating: numberType().int().min(1).max(5),
  comment: stringType().trim().min(10).max(2e3)
}).parse(input)).handler(submitVenueReview_createServerFn_handler, async ({
  context,
  data
}) => {
  if (!await venueReviewsEnabled()) {
    throw new Error("Reviews are not enabled yet — run the venue reviews database migration");
  }
  const completedBooking = await userHasCompletedBooking(context.userId, data.venueId);
  if (!completedBooking) {
    throw new Error("You can review a turf only after playing a completed booking there");
  }
  const payload = {
    venue_id: data.venueId,
    user_id: context.userId,
    booking_id: completedBooking.id,
    rating: data.rating,
    comment: data.comment.trim(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    data: row,
    error
  } = await context.supabase.from("venue_reviews").upsert(payload, {
    onConflict: "venue_id,user_id"
  }).select("id, rating, comment, created_at, updated_at").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
});
export {
  getMyVenueReviewState_createServerFn_handler,
  getVenueReviewSummary_createServerFn_handler,
  listVenueReviews_createServerFn_handler,
  submitVenueReview_createServerFn_handler
};
