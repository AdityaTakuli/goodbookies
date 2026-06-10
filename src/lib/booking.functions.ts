import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateBookingTotal, computeBookingCharge, loadVenuePricing } from "@/lib/pricing";
import { MIN_ORDER_PAISE } from "@/lib/payments/checkout";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/services/razorpay";
import {
  bookingEndMinute,
  bookingStartMinute,
  formatMinBookingDuration,
  formatSlotTime,
  isMinuteBlocked,
  iterateBookingMinutes,
  slotStepMinutes,
  venueCloseMinutes,
  venueOpenMinutes,
} from "@/lib/slot-time";
import { resolveMinBookingMinutes } from "@/lib/venue-extras";

let reviewCountColumnReady: boolean | null = null;

async function venueHasReviewCountColumn() {
  if (reviewCountColumnReady != null) return reviewCountColumnReady;
  const { error } = await supabaseAdmin.from("venues").select("review_count").limit(1);
  reviewCountColumnReady = !error?.message?.includes("review_count");
  return reviewCountColumnReady;
}

const VENUE_CARD_FIELDS =
  "id, name, slug, description, address, city, image_url, price_per_hour, rating, amenities, sport:sports(name, slug, icon)";
const VENUE_DETAIL_FIELDS =
  "id, name, slug, description, address, city, image_url, price_per_hour, opening_hour, closing_hour, slot_duration_minutes, max_players_allowed, venue_type, amenities, rating, owner_id, sport:sports(name, slug, icon)";

const VENUE_DETAIL_FIELDS_EXTENDED =
  `${VENUE_DETAIL_FIELDS}, map_url, area_sq_ft, water_available`;

let venueDetailFieldsReady: boolean | null = null;
let bookingMinuteColumnsReady: boolean | null = null;

async function venueHasBookingMinuteColumns() {
  if (bookingMinuteColumnsReady != null) return bookingMinuteColumnsReady;
  const { error } = await supabaseAdmin.from("bookings").select("start_minute, end_minute").limit(1);
  bookingMinuteColumnsReady = !error?.message?.includes("start_minute");
  return bookingMinuteColumnsReady;
}

async function venueDetailSelectFields() {
  if (venueDetailFieldsReady != null) {
    return venueDetailFieldsReady ? VENUE_DETAIL_FIELDS_EXTENDED : VENUE_DETAIL_FIELDS;
  }
  const { error } = await supabaseAdmin.from("venues").select("map_url, area_sq_ft, water_available").limit(1);
  venueDetailFieldsReady = !error?.message?.includes("map_url");
  return venueDetailFieldsReady ? VENUE_DETAIL_FIELDS_EXTENDED : VENUE_DETAIL_FIELDS;
}

function withReviewCount<T extends Record<string, unknown>>(row: T) {
  return { ...row, review_count: Number(row.review_count ?? 0) };
}

const defaultSports = [
  { name: "Football", slug: "football", icon: "⚽", is_active: true },
  { name: "Cricket", slug: "cricket", icon: "🏏", is_active: true },
  { name: "Badminton", slug: "badminton", icon: "🏸", is_active: true },
  { name: "Basketball", slug: "basketball", icon: "🏀", is_active: true },
];

export const listSports = createServerFn({ method: "GET" }).handler(async () => {
  let { data, error } = await supabaseAdmin
    .from("sports")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(error.message);
  if (!data?.length) {
    const { error: seedErr } = await supabaseAdmin
      .from("sports")
      .upsert(defaultSports, { onConflict: "slug" });
    if (seedErr) throw new Error(seedErr.message);
    const seeded = await supabaseAdmin
      .from("sports")
      .select("id, name, slug, icon")
      .eq("is_active", true)
      .order("name");
    if (seeded.error) throw new Error(seeded.error.message);
    data = seeded.data;
  }
  return data ?? [];
});

export const listVenues = createServerFn({ method: "GET" })
  .inputValidator((input: { sport?: string } | undefined) =>
    z.object({ sport: z.string().min(1).max(64).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const fields = (await venueHasReviewCountColumn())
      ? `${VENUE_CARD_FIELDS.replace("rating,", "rating, review_count,")}`
      : VENUE_CARD_FIELDS;
    let query = supabaseAdmin
      .from("venues")
      .select(fields)
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .order("rating", { ascending: false });
    if (data.sport) {
      const { data: s } = await supabaseAdmin.from("sports").select("id").eq("slug", data.sport).maybeSingle();
      if (s?.id) query = query.eq("sport_id", s.id);
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => withReviewCount(row as Record<string, unknown>));
  });

export const getVenue = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const baseFields = await venueDetailSelectFields();
    const fields = (await venueHasReviewCountColumn())
      ? `${baseFields.replace("rating,", "rating, review_count,")}`
      : baseFields;
    const { data: venue, error } = await supabaseAdmin
      .from("venues")
      .select(fields)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return venue ? withReviewCount(venue as Record<string, unknown>) : null;
  });

export const getSlots = createServerFn({ method: "GET" })
  .inputValidator((input: { venueId: string; date: string; playerCount?: number }) =>
    z.object({
      venueId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      playerCount: z.number().int().min(1).max(100).default(1),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: venue } = await supabaseAdmin
      .from("venues")
      .select("opening_hour, closing_hour, operating_days, holiday_dates, max_players_allowed, slot_duration_minutes")
      .eq("id", data.venueId)
      .maybeSingle();
    if (!venue) throw new Error("Venue not found");

    const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
    const openMin = venueOpenMinutes(venue.opening_hour);
    const closeMin = venueCloseMinutes(venue.closing_hour);

    const dow = new Date(data.date + "T12:00:00").getDay();
    const holidays: string[] = (venue.holiday_dates as string[]) ?? [];
    if (holidays.includes(data.date)) return [];

    const opDays: number[] = (venue.operating_days as number[]) ?? [0, 1, 2, 3, 4, 5, 6];
    if (!opDays.includes(dow)) return [];

    const bookingFields = (await venueHasBookingMinuteColumns())
      ? "id, start_hour, end_hour, start_minute, end_minute, status, player_count, is_open_lobby"
      : "id, start_hour, end_hour, status, player_count, is_open_lobby";

    const [{ data: bookings }, { data: blocks }] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select(bookingFields)
        .eq("venue_id", data.venueId)
        .eq("booking_date", data.date)
        .in("status", ["confirmed", "pending"]),
      supabaseAdmin.from("slot_blocks").select("*").eq("venue_id", data.venueId),
    ]);

    const bookedPlayersByMinute = new Map<number, number>();
    bookings?.forEach((b) => {
      const bStart = bookingStartMinute(b);
      const bEnd = bookingEndMinute(b);
      iterateBookingMinutes(bStart, bEnd, stepMinutes, (m) => {
        bookedPlayersByMinute.set(m, (bookedPlayersByMinute.get(m) ?? 0) + (b.player_count ?? 1));
      });
    });

    const totalCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));

    const openLobbyByMinute = new Map<number, { bookingId: string; isOpen: boolean }>();
    bookings?.forEach((b) => {
      if (!b.is_open_lobby) return;
      const bStart = bookingStartMinute(b);
      const bEnd = bookingEndMinute(b);
      iterateBookingMinutes(bStart, bEnd, stepMinutes, (m) => {
        const rem = totalCapacity - (bookedPlayersByMinute.get(m) ?? 0);
        if (rem > 0) openLobbyByMinute.set(m, { bookingId: b.id, isOpen: true });
      });
    });

    const slots: {
      startMinute: number;
      available: boolean;
      status?: string;
      remaining_capacity: number;
      booked_players: number;
      total_capacity: number;
      open_lobby_booking_id?: string | null;
      is_private_game?: boolean;
    }[] = [];
    const requestedPlayers = Math.max(1, data.playerCount ?? 1);
    for (let m = openMin; m < closeMin; m += stepMinutes) {
      const blocked = isMinuteBlocked(m, blocks ?? [], data.date, dow);
      const bookedPlayers = Math.max(0, bookedPlayersByMinute.get(m) ?? 0);
      const remainingCapacity = Math.max(0, totalCapacity - bookedPlayers);
      const full = remainingCapacity <= 0;
      const enoughForSelection = remainingCapacity >= requestedPlayers;
      const hasPartialPrivate = bookedPlayers > 0 && !openLobbyByMinute.has(m);
      slots.push({
        startMinute: m,
        available: !blocked && enoughForSelection,
        status: blocked ? "blocked" : full ? "booked" : bookedPlayers > 0 ? "partial" : "available",
        remaining_capacity: remainingCapacity,
        booked_players: bookedPlayers,
        total_capacity: totalCapacity,
        open_lobby_booking_id: openLobbyByMinute.get(m)?.bookingId ?? null,
        is_private_game: hasPartialPrivate,
      });
    }
    return slots;
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { venueId: string; date: string; startMinute: number; endMinute: number; playerCount?: number; playerNames?: string[]; isOpenLobby?: boolean; couponCode?: string }) =>
    z.object({
      venueId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startMinute: z.number().int().min(0).max(1410),
      endMinute: z.number().int().min(30).max(1440),
      playerCount: z.number().int().min(1).max(100).default(1),
      playerNames: z.array(z.string().trim().min(1).max(60)).optional(),
      isOpenLobby: z.boolean().default(false),
      couponCode: z.string().optional(),
    })
      .refine((v) => v.endMinute > v.startMinute, { message: "endMinute must be > startMinute" })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: venue, error: vErr } = await supabaseAdmin
      .from("venues")
      .select("slug, price_per_hour, confirmation_mode, owner_id, max_players_allowed, slot_duration_minutes")
      .eq("id", data.venueId)
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .maybeSingle();
    if (vErr || !venue) throw new Error("Venue not found");
    const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
    const minBookingMinutes = resolveMinBookingMinutes(venue);
    if (data.endMinute - data.startMinute < minBookingMinutes) {
      throw new Error(`Minimum booking is ${formatMinBookingDuration(minBookingMinutes)}`);
    }
    if ((data.endMinute - data.startMinute) % stepMinutes !== 0) {
      throw new Error("Invalid slot duration for this turf");
    }
    if (venue.owner_id && venue.owner_id === context.userId) {
      throw new Error("Partners cannot book their own turf. Book other venues as a player, or manage slots from Partner.");
    }
    const maxCap = Math.max(1, Number(venue.max_players_allowed ?? 1));
    if (data.playerCount !== 1 && data.playerCount !== maxCap) {
      throw new Error("Book an individual spot for yourself or reserve the full turf");
    }
    if (data.playerCount > maxCap) {
      throw new Error(`Only ${maxCap} players are allowed for this turf`);
    }
    let normalizedNames = (data.playerNames ?? []).map((name) => name.trim()).filter(Boolean);
    if (normalizedNames.length === 0) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", context.userId)
        .maybeSingle();
      const bookerName =
        profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Player";
      normalizedNames = [bookerName];
    }
    const { data: overlaps, error: overlapErr } = await supabaseAdmin
      .from("bookings")
      .select(
        (await venueHasBookingMinuteColumns())
          ? "start_hour, end_hour, start_minute, end_minute, player_count"
          : "start_hour, end_hour, player_count",
      )
      .eq("venue_id", data.venueId)
      .eq("booking_date", data.date)
      .in("status", ["confirmed", "pending"]);
    if (overlapErr) throw new Error(overlapErr.message);
    const maxCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
    iterateBookingMinutes(data.startMinute, data.endMinute, stepMinutes, (m) => {
      const used = (overlaps ?? []).reduce((sum, b) => {
        const bStart = bookingStartMinute(b);
        const bEnd = bookingEndMinute(b);
        if (m >= bStart && m < bEnd) return sum + (b.player_count ?? 1);
        return sum;
      }, 0);
      if (used + data.playerCount > maxCapacity) {
        throw new Error(`Not enough capacity at ${formatSlotTime(m)}. Please pick another slot.`);
      }
    });

    const pricing = await loadVenuePricing(data.venueId);
    let coupon = null;
    if (data.couponCode) {
      const { data: c } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", data.couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (c && (!c.venue_id || c.venue_id === data.venueId)) coupon = c;
    }

    const total = calculateBookingTotal({
      basePricePerHour: venue.price_per_hour,
      bookingDate: data.date,
      startMinute: data.startMinute,
      endMinute: data.endMinute,
      slotStepMinutes: stepMinutes,
      dayPricing: pricing.dayPricing,
      datePricing: pricing.datePricing,
      peakRules: pricing.peakRules,
      durationDiscounts: pricing.durationDiscounts,
      coupon: coupon ? { discount_type: coupon.discount_type, discount_value: coupon.discount_value } : null,
    });

    const openLobby = false;
    const { charge: chargeAmount } = computeBookingCharge(total, maxCap, data.playerCount);

    const amountPaise = chargeAmount * 100;
    const requiresPayment = isRazorpayConfigured() && amountPaise >= MIN_ORDER_PAISE;
    const status = requiresPayment ? "pending" : "confirmed";
    const order = await createRazorpayOrder(amountPaise, `bk_${Date.now()}`);
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: context.userId,
        amount: chargeAmount,
        razorpay_order_id: order.id,
        status: requiresPayment ? "created" : "success",
      })
      .select("id")
      .single();
    if (payErr) throw new Error(payErr.message);

    const bookingInsert: Record<string, unknown> = {
      user_id: context.userId,
      venue_id: data.venueId,
      booking_date: data.date,
      player_count: data.playerCount,
      player_names: normalizedNames,
      is_open_lobby: openLobby,
      total_price: total,
      status,
      coupon_code: data.couponCode?.toUpperCase() ?? null,
      payment_id: payment.id,
    };

    if (await venueHasBookingMinuteColumns()) {
      bookingInsert.start_hour = Math.floor(data.startMinute / 60);
      bookingInsert.end_hour = Math.ceil(data.endMinute / 60);
      bookingInsert.start_minute = data.startMinute;
      bookingInsert.end_minute = data.endMinute;
    } else {
      bookingInsert.start_hour = data.startMinute;
      bookingInsert.end_hour = data.endMinute;
    }

    const { data: booking, error } = await context.supabase
      .from("bookings")
      .insert(bookingInsert)
      .select("id")
      .single();
    if (error) throw new Error(error.message.includes("bookings_no_double_book") ? "One of those slots was just booked. Pick another." : error.message);

    await supabaseAdmin.from("payments").update({ booking_id: booking.id }).eq("id", payment.id);

    if (coupon && !requiresPayment) {
      await supabaseAdmin.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("id", coupon.id);
    }

    if (!requiresPayment) {
      await supabaseAdmin.from("notifications").insert({
        user_id: context.userId,
        title: "Booking confirmed",
        message: `Your slot on ${data.date} is confirmed. See you on the turf!`,
        type: "booking",
      });

      if (venue.owner_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: venue.owner_id,
          title: "New booking",
          message: `New confirmed booking on ${data.date}.`,
          type: "booking",
        });
      }
    }

    return {
      bookingId: booking.id,
      total: chargeAmount,
      fullTotal: total,
      amountPaise,
      razorpayOrderId: order.id,
      razorpayKeyId: process.env.VITE_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? null,
      requiresPayment,
      status,
      isOpenLobby: openLobby,
    };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("id, booking_date, start_hour, end_hour, player_count, player_names, is_open_lobby, total_price, status, venue:venues(name, slug, image_url, city, max_players_allowed, sport:sports(name, icon))")
      .order("booking_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });