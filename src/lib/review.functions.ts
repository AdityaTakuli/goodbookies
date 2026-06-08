import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

let reviewsTableReady: boolean | null = null;

async function venueReviewsEnabled() {
  if (reviewsTableReady != null) return reviewsTableReady;
  const { error } = await supabaseAdmin.from("venue_reviews").select("id").limit(1);
  reviewsTableReady = !error?.message?.includes("venue_reviews");
  return reviewsTableReady;
}

const emptySummary = {
  averageRating: null as number | null,
  totalReviews: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isBookingCompleted(booking: {
  booking_date: string;
  end_hour: number;
  status: string;
}) {
  if (booking.status !== "confirmed") return false;
  const today = todayISO();
  if (booking.booking_date < today) return true;
  if (booking.booking_date > today) return false;
  return booking.end_hour <= new Date().getHours();
}

async function userHasCompletedBooking(userId: string, venueId: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, booking_date, end_hour, status")
    .eq("user_id", userId)
    .eq("venue_id", venueId)
    .eq("status", "confirmed")
    .order("booking_date", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []).find((b) => isBookingCompleted(b)) ?? null;
}

export const getVenueReviewSummary = createServerFn({ method: "GET" })
  .inputValidator((input: { venueId: string }) =>
    z.object({ venueId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!(await venueReviewsEnabled())) return emptySummary;

    let venue: { rating: number | null; review_count?: number } | null = null;
    const withCount = await supabaseAdmin
      .from("venues")
      .select("rating, review_count")
      .eq("id", data.venueId)
      .maybeSingle();
    if (withCount.error?.message.includes("review_count")) {
      const fallback = await supabaseAdmin
        .from("venues")
        .select("rating")
        .eq("id", data.venueId)
        .maybeSingle();
      if (fallback.error) throw new Error(fallback.error.message);
      venue = fallback.data;
    } else {
      if (withCount.error) throw new Error(withCount.error.message);
      venue = withCount.data;
    }

    const { data: rows, error } = await supabaseAdmin
      .from("venue_reviews")
      .select("rating")
      .eq("venue_id", data.venueId);
    if (error) throw new Error(error.message);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    for (const row of rows ?? []) {
      const star = Number(row.rating);
      if (star >= 1 && star <= 5) distribution[star] += 1;
    }

    const total = venue?.review_count ?? rows?.length ?? 0;
    return {
      averageRating: venue?.rating != null ? Number(venue.rating) : null,
      totalReviews: total,
      distribution,
    };
  });

export const listVenueReviews = createServerFn({ method: "GET" })
  .inputValidator((input: { venueId: string; limit?: number }) =>
    z.object({
      venueId: z.string().uuid(),
      limit: z.number().int().min(1).max(50).default(20),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!(await venueReviewsEnabled())) return [];

    const { data: rows, error } = await supabaseAdmin
      .from("venue_reviews")
      .select("id, rating, comment, created_at, updated_at, user_id")
      .eq("venue_id", data.venueId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
    const profileMap = new Map<string, { full_name: string | null; email: string | null }>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      for (const p of profiles ?? []) profileMap.set(p.id, p);
    }

    return (rows ?? []).map((r) => {
      const profile = profileMap.get(r.user_id);
      const name =
        profile?.full_name?.trim() ||
        profile?.email?.split("@")[0] ||
        "Player";
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        authorName: name,
        isEdited: r.updated_at !== r.created_at,
      };
    });
  });

export const getMyVenueReviewState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { venueId: string }) =>
    z.object({ venueId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!(await venueReviewsEnabled())) {
      return { canReview: false, myReview: null };
    }

    const completedBooking = await userHasCompletedBooking(context.userId, data.venueId);

    const { data: existing, error } = await context.supabase
      .from("venue_reviews")
      .select("id, rating, comment, created_at, updated_at")
      .eq("venue_id", data.venueId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    return {
      canReview: Boolean(completedBooking),
      myReview: existing
        ? {
            id: existing.id,
            rating: existing.rating,
            comment: existing.comment,
            createdAt: existing.created_at,
            updatedAt: existing.updated_at,
          }
        : null,
    };
  });

export const submitVenueReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { venueId: string; rating: number; comment: string }) =>
    z.object({
      venueId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(10).max(2000),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!(await venueReviewsEnabled())) {
      throw new Error("Reviews are not enabled yet. Run the venue reviews database migration.");
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
      updated_at: new Date().toISOString(),
    };

    const { data: row, error } = await context.supabase
      .from("venue_reviews")
      .upsert(payload, { onConflict: "venue_id,user_id" })
      .select("id, rating, comment, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);

    return {
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
