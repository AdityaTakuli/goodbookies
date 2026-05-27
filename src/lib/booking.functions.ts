import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSports = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("sports")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(error.message);
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
      .select("id, name, slug, description, address, city, image_url, price_per_hour, opening_hour, closing_hour, slot_duration_minutes, amenities, rating, sport:sports(name, slug, icon)")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return venue;
  });

export const getSlots = createServerFn({ method: "GET" })
  .inputValidator((input: { venueId: string; date: string }) =>
    z.object({
      venueId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: venue } = await supabaseAdmin
      .from("venues")
      .select("opening_hour, closing_hour")
      .eq("id", data.venueId)
      .maybeSingle();
    if (!venue) throw new Error("Venue not found");

    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("start_hour, end_hour")
      .eq("venue_id", data.venueId)
      .eq("booking_date", data.date)
      .eq("status", "confirmed");

    const booked = new Set<number>();
    bookings?.forEach((b) => {
      for (let h = b.start_hour; h < b.end_hour; h++) booked.add(h);
    });

    const slots: { hour: number; available: boolean }[] = [];
    for (let h = venue.opening_hour; h < venue.closing_hour; h++) {
      slots.push({ hour: h, available: !booked.has(h) });
    }
    return slots;
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { venueId: string; date: string; startHour: number; endHour: number }) =>
    z.object({
      venueId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startHour: z.number().int().min(0).max(23),
      endHour: z.number().int().min(1).max(24),
    }).refine((v) => v.endHour > v.startHour, { message: "endHour must be > startHour" }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: venue, error: vErr } = await context.supabase
      .from("venues")
      .select("price_per_hour")
      .eq("id", data.venueId)
      .maybeSingle();
    if (vErr || !venue) throw new Error("Venue not found");

    const total = venue.price_per_hour * (data.endHour - data.startHour);

    const { data: booking, error } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        venue_id: data.venueId,
        booking_date: data.date,
        start_hour: data.startHour,
        end_hour: data.endHour,
        total_price: total,
        status: "confirmed",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message.includes("bookings_no_double_book") ? "One of those slots was just booked. Pick another." : error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      title: "Booking confirmed",
      message: `Your slot on ${data.date} is confirmed. See you on the turf!`,
      type: "booking",
    });

    return { bookingId: booking.id, total };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("id, booking_date, start_hour, end_hour, total_price, status, venue:venues(name, slug, image_url, city, sport:sports(name, icon))")
      .order("booking_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });