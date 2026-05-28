import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateBookingTotal, loadVenuePricing } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/services/razorpay";

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
    let query = supabaseAdmin
      .from("venues")
      .select("id, name, slug, description, address, city, image_url, price_per_hour, rating, amenities, sport:sports(name, slug, icon)")
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .order("rating", { ascending: false });
    if (data.sport) {
      const { data: s } = await supabaseAdmin.from("sports").select("id").eq("slug", data.sport).maybeSingle();
      if (s?.id) query = query.eq("sport_id", s.id);
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getVenue = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: venue, error } = await supabaseAdmin
      .from("venues")
      .select("id, name, slug, description, address, city, image_url, price_per_hour, opening_hour, closing_hour, slot_duration_minutes, max_players_allowed, amenities, rating, sport:sports(name, slug, icon)")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return venue;
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
      .select("opening_hour, closing_hour, operating_days, holiday_dates, max_players_allowed")
      .eq("id", data.venueId)
      .maybeSingle();
    if (!venue) throw new Error("Venue not found");

    const dow = new Date(data.date + "T12:00:00").getDay();
    const holidays: string[] = (venue.holiday_dates as string[]) ?? [];
    if (holidays.includes(data.date)) return [];

    const opDays: number[] = (venue.operating_days as number[]) ?? [0, 1, 2, 3, 4, 5, 6];
    if (!opDays.includes(dow)) return [];

    const [{ data: bookings }, { data: blocks }] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("start_hour, end_hour, status, player_count")
        .eq("venue_id", data.venueId)
        .eq("booking_date", data.date)
        .in("status", ["confirmed", "pending"]),
      supabaseAdmin.from("slot_blocks").select("*").eq("venue_id", data.venueId),
    ]);

    const bookedPlayersByHour = new Map<number, number>();
    bookings?.forEach((b) => {
      for (let h = b.start_hour; h < b.end_hour; h++) {
        bookedPlayersByHour.set(h, (bookedPlayersByHour.get(h) ?? 0) + (b.player_count ?? 1));
      }
    });

    const isBlocked = (hour: number) => {
      for (const bl of blocks ?? []) {
        if (bl.is_recurring && bl.recurrence_day === dow) {
          const sh = Number(String(bl.start_time).slice(0, 2));
          const eh = Number(String(bl.end_time).slice(0, 2));
          if (hour >= sh && hour < eh) return true;
        }
        if (bl.block_date === data.date) {
          const sh = Number(String(bl.start_time).slice(0, 2));
          const eh = Number(String(bl.end_time).slice(0, 2));
          if (hour >= sh && hour < eh) return true;
        }
      }
      return false;
    };

    const slots: { hour: number; available: boolean; status?: string; remaining_capacity: number; booked_players: number; total_capacity: number }[] = [];
    const totalCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
    const requestedPlayers = Math.max(1, data.playerCount ?? 1);
    for (let h = venue.opening_hour; h < venue.closing_hour; h++) {
      const blocked = isBlocked(h);
      const bookedPlayers = Math.max(0, bookedPlayersByHour.get(h) ?? 0);
      const remainingCapacity = Math.max(0, totalCapacity - bookedPlayers);
      const full = remainingCapacity <= 0;
      const enoughForSelection = remainingCapacity >= requestedPlayers;
      slots.push({
        hour: h,
        available: !blocked && enoughForSelection,
        status: blocked ? "blocked" : full ? "booked" : "available",
        remaining_capacity: remainingCapacity,
        booked_players: bookedPlayers,
        total_capacity: totalCapacity,
      });
    }
    return slots;
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { venueId: string; date: string; startHour: number; endHour: number; playerCount?: number; playerNames?: string[]; couponCode?: string }) =>
    z.object({
      venueId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startHour: z.number().int().min(0).max(23),
      endHour: z.number().int().min(1).max(24),
      playerCount: z.number().int().min(1).max(100).default(1),
      playerNames: z.array(z.string().trim().min(1).max(60)).default([]),
      couponCode: z.string().optional(),
    })
      .refine((v) => v.endHour > v.startHour, { message: "endHour must be > startHour" })
      .refine((v) => v.playerNames.length === v.playerCount, {
        message: "Please provide one player name per selected player",
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: venue, error: vErr } = await supabaseAdmin
      .from("venues")
      .select("price_per_hour, confirmation_mode, owner_id, max_players_allowed")
      .eq("id", data.venueId)
      .eq("is_active", true)
      .eq("approval_status", "approved")
      .maybeSingle();
    if (vErr || !venue) throw new Error("Venue not found");
    if (data.playerCount > (venue.max_players_allowed ?? 1)) {
      throw new Error(`Only ${venue.max_players_allowed} players are allowed for this turf`);
    }
    const normalizedNames = data.playerNames.map((name) => name.trim()).filter(Boolean);
    const uniqueNames = new Set(normalizedNames.map((name) => name.toLowerCase()));
    if (normalizedNames.length !== data.playerCount) {
      throw new Error("Please provide one player name per selected player");
    }
    if (uniqueNames.size !== normalizedNames.length) {
      throw new Error("Each player name must be unique");
    }
    const { data: overlaps, error: overlapErr } = await supabaseAdmin
      .from("bookings")
      .select("start_hour, end_hour, player_count")
      .eq("venue_id", data.venueId)
      .eq("booking_date", data.date)
      .in("status", ["confirmed", "pending"]);
    if (overlapErr) throw new Error(overlapErr.message);
    const maxCapacity = Math.max(1, Number(venue.max_players_allowed ?? 1));
    for (let h = data.startHour; h < data.endHour; h++) {
      const used = (overlaps ?? []).reduce((sum, b) => {
        if (h >= b.start_hour && h < b.end_hour) return sum + (b.player_count ?? 1);
        return sum;
      }, 0);
      if (used + data.playerCount > maxCapacity) {
        throw new Error(`Not enough capacity at ${h}:00. Please pick another slot.`);
      }
    }

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
      startHour: data.startHour,
      endHour: data.endHour,
      dayPricing: pricing.dayPricing,
      datePricing: pricing.datePricing,
      peakRules: pricing.peakRules,
      durationDiscounts: pricing.durationDiscounts,
      coupon: coupon ? { discount_type: coupon.discount_type, discount_value: coupon.discount_value } : null,
    });

    const status = venue.confirmation_mode === "manual" ? "pending" : "confirmed";
    const order = await createRazorpayOrder(total * 100, `bk_${Date.now()}`);
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: context.userId,
        amount: total,
        razorpay_order_id: order.id,
        status: process.env.RAZORPAY_KEY_ID ? "created" : "success",
      })
      .select("id")
      .single();
    if (payErr) throw new Error(payErr.message);

    const { data: booking, error } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        venue_id: data.venueId,
        booking_date: data.date,
        start_hour: data.startHour,
        end_hour: data.endHour,
        player_count: data.playerCount,
        player_names: normalizedNames,
        total_price: total,
        status,
        coupon_code: data.couponCode?.toUpperCase() ?? null,
        payment_id: payment.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message.includes("bookings_no_double_book") ? "One of those slots was just booked. Pick another." : error.message);

    await supabaseAdmin.from("payments").update({ booking_id: booking.id }).eq("id", payment.id);

    if (coupon) {
      await supabaseAdmin.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("id", coupon.id);
    }

    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      title: status === "confirmed" ? "Booking confirmed" : "Booking pending",
      message: status === "confirmed"
        ? `Your slot on ${data.date} is confirmed. See you on the turf!`
        : `Your booking awaits venue confirmation.`,
      type: "booking",
    });

    if (venue.owner_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: venue.owner_id,
        title: "New booking",
        message: `New ${status} booking on ${data.date}.`,
        type: "booking",
      });
    }

    return { bookingId: booking.id, total, razorpayOrderId: order.id, status };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("id, booking_date, start_hour, end_hour, player_count, player_names, total_price, status, venue:venues(name, slug, image_url, city, max_players_allowed, sport:sports(name, icon))")
      .order("booking_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });